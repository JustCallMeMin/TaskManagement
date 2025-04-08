import api from "../../../services/api.service";
import ProjectService from '../../projects/services/project.service';
import { toast } from 'react-toastify';

class NotificationService {
  /**
   * Get all notifications for the current user
   * For now, we'll just combine real invitations with mock data
   */
  async getUserNotifications() {
    try {
      // Get real project invitations
      const projectInvitations = await ProjectService.getMyInvitations();
      
      // Convert project invitations to notification format
      const invitationNotifications = projectInvitations.map(invitation => {
        return {
          _id: invitation._id,
          content: `${invitation.invitedBy?.fullName || 'Someone'} đã mời bạn tham gia dự án "${invitation.projectId?.name || 'Unnamed Project'}"`,
          type: 'PROJECT_INVITED',
          isRead: false,
          status: invitation.status?.toLowerCase() || 'pending', // Dùng status thật từ backend, chuyển về lowercase để thống nhất
          createdAt: new Date(invitation.createdAt),
          fromUser: {
            _id: invitation.invitedBy?._id || '',
            name: invitation.invitedBy?.fullName || 'Unknown',
            avatar: invitation.invitedBy?.avatar || ''
          },
          referenceId: invitation._id,
          projectId: invitation.projectId?._id
        };
      });
      
      // Return only invitation notifications for now
      // In the future, you can integrate with other notification types
      return invitationNotifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Show toast only for non-network errors (network errors are handled by api service)
      if (error.response && error.response.status !== 401) {
        toast.error('Không thể tải thông báo. Vui lòng thử lại sau.');
      }
      return [];
    }
  }
  
  /**
   * Handle a project invitation response
   * @param {string} invitationId 
   * @param {boolean} accept 
   * @param {function} onComplete Optional callback for UI refresh
   * @returns {Promise}
   */
  async handleInvitationResponse(invitationId, accept, onComplete) {
    try {
      // Display a loading toast
      const loadingToastId = toast.info(
        `Đang ${accept ? 'chấp nhận' : 'từ chối'} lời mời...`, 
        { autoClose: false, closeButton: false }
      );

      // Validate invitation ID
      if (!invitationId || typeof invitationId !== 'string') {
        toast.dismiss(loadingToastId);
        toast.error('Mã lời mời không hợp lệ');
        throw new Error('Invalid invitation ID');
      }

      // Prepare user ID for backend context
      const userId = localStorage.getItem('userId');
      
      try {
        // Make a single API call with proper error handling
        const endpoint = accept 
          ? `/projects/invitations/${invitationId}/accept`
          : `/projects/invitations/${invitationId}/reject`;
          
        const payload = accept ? { invitationId, userId } : {};
        
        // Add request metadata to help with debugging
        const requestOptions = {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          timeout: 10000 // 10 second timeout
        };
        
        // Make the API call
        const result = await api.post(endpoint, payload, requestOptions);
        
        // Success!
        toast.dismiss(loadingToastId);
        toast.success(`Đã ${accept ? 'chấp nhận' : 'từ chối'} lời mời thành công!`);
        
        // After successful acceptance, refresh projects list
        if (accept) {
          try {
            // Refresh projects in the background
            await api.get('/projects', { headers: { 'Cache-Control': 'no-cache' } });
            
            // For user experience - small delay to allow database consistency
            await new Promise(resolve => setTimeout(resolve, 300));
          } catch (refreshError) {
            console.warn('Project refresh after invitation acceptance failed:', refreshError);
            // Don't show error to user as this is just a background refresh
          }
        }
        
        // Clean up any cached data
        this.clearCachedData();
        
        // Call the completion callback if provided
        if (typeof onComplete === 'function') {
          onComplete(accept, result?.data);
        }
        
        // Broadcast an event for other components to update
        window.dispatchEvent(new CustomEvent('invitationStatusChanged', {
          detail: { accepted: accept, invitationId }
        }));
        
        return result?.data;
      } catch (error) {
        // Dismiss the loading toast
        toast.dismiss(loadingToastId);
        
        // Handle different error types
        if (error.code === 'ECONNABORTED') {
          toast.error('Yêu cầu bị hủy do kết nối quá chậm. Vui lòng thử lại.');
        } else if (error.response?.status === 401) {
          toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        } else if (error.response?.status === 403) {
          toast.error('Bạn không có quyền thực hiện hành động này.');
        } else if (error.response?.status === 404) {
          toast.error('Không tìm thấy lời mời hoặc đã hết hạn.');
        } else {
          toast.error(`Không thể ${accept ? 'chấp nhận' : 'từ chối'} lời mời. Vui lòng thử lại sau.`);
        }
        
        // Re-throw for caller handling
        throw error;
      }
    } catch (error) {
      console.error(`Error ${accept ? 'accepting' : 'rejecting'} invitation:`, error);
      throw error;
    }
  }
  
  /**
   * Clear all cached data related to notifications and projects
   */
  clearCachedData() {
    try {
      // Clear any session storage caches
      if (window.sessionStorage) {
        sessionStorage.removeItem('userNotifications');
        sessionStorage.removeItem('userProjects');
        sessionStorage.removeItem('projectMembers');
        sessionStorage.removeItem('projectInvitations');
      }
      
      // Clear any localStorage caches if applicable
      const cachesToClear = ['notifications', 'projects', 'invitations'];
      cachesToClear.forEach(cacheKey => {
        const fullKey = `cache_${cacheKey}`;
        if (localStorage.getItem(fullKey)) {
          localStorage.removeItem(fullKey);
        }
      });
      
      console.log('All notification and project caches cleared');
    } catch (error) {
      console.warn('Error clearing cached data:', error);
    }
  }
}

export default new NotificationService();
