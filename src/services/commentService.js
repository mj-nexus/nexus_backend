const { Comment, User, Profile } = require("../models");

// 댓글 생성
exports.createComment = async (data) => {
    return await Comment.create(data);
};

// 게시글별 댓글 목록 조회
exports.getCommentsByBoardId = async (board_id) => {
    return await Comment.findAll({
        where: { board_id, deletedate: null },
        order: [["regdate", "ASC"]],
        include: [
            {
                model: User,
                attributes: ["user_id", "student_id"],
                include: [
                    {
                        model: Profile,
                        attributes: ["user_name", "nick_name", "profile_image"]
                    }
                ]
            }
        ]
    });
};

// 댓글 단일 조회
exports.getCommentById = async (comment_id) => {
    return await Comment.findByPk(comment_id, {
        include: [
            {
                model: User,
                attributes: ["user_id", "student_id"],
                include: [
                    {
                        model: Profile,
                        attributes: ["user_name", "nick_name", "profile_image"]
                    }
                ]
            }
        ]
    });
};

// 댓글 수정
exports.updateComment = async (comment_id, content) => {
    const comment = await Comment.findByPk(comment_id);
    if (!comment) return null;
    comment.content = content;
    comment.updatedate = new Date();
    await comment.save();
    return comment;
};

// 댓글 삭제 (soft delete)
exports.deleteComment = async (comment_id) => {
    const comment = await Comment.findByPk(comment_id);
    if (!comment) return null;
    comment.deletedate = new Date();
    await comment.save();
    return true;
}; 