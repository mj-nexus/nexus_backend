const { Board, SeniorBoard, Trash, Comment } = require('../models');
const axios = require('axios');

// GPT API를 통한 컨텐츠 검증
async function validateContentWithGPT(content) {
    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: "당신은 게시글의 유해성을 판단하는 엄격한 검수자입니다. 게시글에 비방, 비속어, 혐오 표현이 포함되어 있는지 분석하고, 유해하다면 1을, 아니라면 0을 반환하세요."
                },
                {
                    role: "user",
                    content: content
                }
            ],
            temperature: 0,
            max_tokens: 1
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const result = response.data.choices[0].message.content.trim();
        return result === "1" ? 1 : 0;
    } catch (error) {
        console.error('GPT API 호출 중 오류:', error);
        return null;
    }
}

// 게시글 신고 및 검증
exports.reportPost = async (boardType, postId) => {
    try {
        let post;
        let Model = boardType === 'board' ? Board : SeniorBoard;
        
        post = await Model.findByPk(postId);
        if (!post) {
            throw new Error('게시글을 찾을 수 없습니다.');
        }

        // GPT로 컨텐츠 검증
        const gptScore = await validateContentWithGPT(post.content);
        
        if (gptScore === 1) {
            // 유해 컨텐츠로 판단된 경우 Trash로 이동
            await Trash.create({
                original_id: post.id || post.board_id,
                board_type: boardType,
                writer_id: post.writer_id,
                title: post.title,
                content: post.content,
                report_count: 1,
                gpt_score: gptScore
            });

            // 먼저 관련된 댓글들을 삭제
            await Comment.destroy({
                where: { board_id: postId }
            });

            // 그 다음 원본 게시글 삭제
            await post.destroy();

            return {
                success: true,
                message: '유해 컨텐츠로 판단되어 삭제되었습니다.',
                isHarmful: true
            };
        }

        return {
            success: true,
            message: '게시글이 검토되었으나 유해하지 않은 것으로 판단되었습니다.',
            isHarmful: false
        };

    } catch (error) {
        console.error('게시글 신고 처리 중 오류:', error);
        throw error;
    }
}; 