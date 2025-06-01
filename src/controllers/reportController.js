const reportService = require('../services/reportService');

// 게시글 신고 처리
exports.reportPost = async (req, res) => {
    try {
        const { boardType, postId } = req.body;
        
        // 필수 파라미터 검증
        if (!boardType || !postId) {
            return res.status(400).json({
                success: false,
                message: '게시판 타입과 게시글 ID는 필수입니다.'
            });
        }

        // 게시판 타입 검증
        if (!['board', 'senior_board'].includes(boardType)) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 게시판 타입입니다.'
            });
        }

        const result = await reportService.reportPost(boardType, postId);
        res.json(result);

    } catch (error) {
        console.error('게시글 신고 처리 중 오류:', error);
        res.status(500).json({
            success: false,
            message: error.message || '게시글 신고 처리 중 오류가 발생했습니다.'
        });
    }
}; 