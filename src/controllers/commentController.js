const commentService = require('../services/commentService');

// 댓글 생성
exports.createComment = async (req, res) => {
    try {
        const comment = await commentService.createComment(req.body);
        res.status(201).json(comment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 게시글별 댓글 목록 조회
exports.getCommentsByBoardId = async (req, res) => {
    try {
        const { board_id } = req.params;
        const comments = await commentService.getCommentsByBoardId(board_id);
        res.json(comments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 댓글 단일 조회
exports.getCommentById = async (req, res) => {
    try {
        const { comment_id } = req.params;
        const comment = await commentService.getCommentById(comment_id);
        if (!comment) return res.status(404).json({ error: '댓글을 찾을 수 없습니다.' });
        res.json(comment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 댓글 수정
exports.updateComment = async (req, res) => {
    try {
        const { comment_id } = req.params;
        const { content } = req.body;
        const comment = await commentService.updateComment(comment_id, content);
        if (!comment) return res.status(404).json({ error: '댓글을 찾을 수 없습니다.' });
        res.json(comment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 댓글 삭제
exports.deleteComment = async (req, res) => {
    try {
        const { comment_id } = req.params;
        const result = await commentService.deleteComment(comment_id);
        if (!result) return res.status(404).json({ error: '댓글을 찾을 수 없습니다.' });
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}; 