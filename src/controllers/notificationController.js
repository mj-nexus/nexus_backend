const { Notification, User, Profile } = require("../models");

/**
 * 사용자의 알림 목록 조회
 * @route GET /api/notifications/:user_id
 * @param {object} req - 요청 객체
 * @param {object} res - 응답 객체
 * @returns {object} 알림 목록
 */
exports.getUserNotifications = async (req, res) => {
    try {
        const { user_id } = req.params;
        const { page = 1, limit = 20, unread_only = false } = req.query;
        
        const offset = (page - 1) * limit;
        
        // 읽지 않은 알림만 조회할지 여부
        const whereClause = {
            user_id: user_id
        };
        
        if (unread_only === 'true') {
            whereClause.is_read = false;
        }
        
        // 알림 조회 (발신자 정보 포함)
        const notifications = await Notification.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'sender',
                    attributes: ['user_id'],
                    include: [
                        {
                            model: Profile,
                            attributes: ['user_name', 'nick_name', 'profile_image']
                        }
                    ]
                }
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: offset
        });
        
        const totalPages = Math.ceil(notifications.count / limit);
        
        return res.status(200).json({
            success: true,
            data: notifications.rows,
            pagination: {
                total: notifications.count,
                totalPages,
                currentPage: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('알림 조회 오류:', error);
        return res.status(500).json({
            success: false,
            error: '알림 조회 중 오류가 발생했습니다.'
        });
    }
};

/**
 * 알림 읽음 상태 변경
 * @route PATCH /api/notifications/:user_id/:notification_id/read
 * @param {object} req - 요청 객체
 * @param {object} res - 응답 객체
 * @returns {object} 결과
 */
exports.markNotificationAsRead = async (req, res) => {
    try {
        const { notification_id, user_id } = req.params;
        
        // 알림 조회
        const notification = await Notification.findOne({
            where: {
                id: notification_id,
                user_id: user_id
            }
        });
        
        if (!notification) {
            return res.status(404).json({
                success: false,
                error: '알림을 찾을 수 없습니다.'
            });
        }
        
        // 읽음 상태로 업데이트
        await notification.update({ is_read: true });
        
        return res.status(200).json({
            success: true,
            message: '알림이 읽음 상태로 변경되었습니다.'
        });
    } catch (error) {
        console.error('알림 상태 변경 오류:', error);
        return res.status(500).json({
            success: false,
            error: '알림 상태 변경 중 오류가 발생했습니다.'
        });
    }
};

/**
 * 모든 알림 읽음 상태로 변경
 * @route PATCH /api/notifications/:user_id/read-all
 * @param {object} req - 요청 객체
 * @param {object} res - 응답 객체
 * @returns {object} 결과
 */
exports.markAllNotificationsAsRead = async (req, res) => {
    try {
        const { user_id } = req.params;
        
        // 모든 알림 읽음 상태로 업데이트
        await Notification.update(
            { is_read: true },
            { where: { user_id: user_id, is_read: false } }
        );
        
        return res.status(200).json({
            success: true,
            message: '모든 알림이 읽음 상태로 변경되었습니다.'
        });
    } catch (error) {
        console.error('알림 일괄 상태 변경 오류:', error);
        return res.status(500).json({
            success: false,
            error: '알림 일괄 상태 변경 중 오류가 발생했습니다.'
        });
    }
};

/**
 * 알림 삭제
 * @route DELETE /api/notifications/:user_id/:notification_id
 * @param {object} req - 요청 객체
 * @param {object} res - 응답 객체
 * @returns {object} 결과
 */
exports.deleteNotification = async (req, res) => {
    try {
        const { notification_id, user_id } = req.params;
        
        // 알림 조회
        const notification = await Notification.findOne({
            where: {
                id: notification_id,
                user_id: user_id
            }
        });
        
        if (!notification) {
            return res.status(404).json({
                success: false,
                error: '알림을 찾을 수 없습니다.'
            });
        }
        
        // 알림 삭제
        await notification.destroy();
        
        return res.status(200).json({
            success: true,
            message: '알림이 삭제되었습니다.'
        });
    } catch (error) {
        console.error('알림 삭제 오류:', error);
        return res.status(500).json({
            success: false,
            error: '알림 삭제 중 오류가 발생했습니다.'
        });
    }
};

/**
 * 읽지 않은 알림 개수 조회
 * @route GET /api/notifications/:user_id/unread-count
 * @param {object} req - 요청 객체
 * @param {object} res - 응답 객체
 * @returns {object} 읽지 않은 알림 개수
 */
exports.getUnreadNotificationCount = async (req, res) => {
    try {
        const { user_id } = req.params;
        
        // 읽지 않은 알림 개수 조회
        const unreadCount = await Notification.count({
            where: {
                user_id: user_id,
                is_read: false
            }
        });
        
        return res.status(200).json({
            success: true,
            unreadCount: unreadCount
        });
    } catch (error) {
        console.error('읽지 않은 알림 개수 조회 오류:', error);
        return res.status(500).json({
            success: false,
            error: '읽지 않은 알림 개수 조회 중 오류가 발생했습니다.'
        });
    }
}; 