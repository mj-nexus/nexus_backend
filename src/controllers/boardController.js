const boardService = require('../services/boardService');
const {getUserById} = require("./userController");

exports.createBoard = async (req, res) => {
  try {
    const board = await boardService.createBoard(req.body);
    res.status(201).json(board);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBoards = async (req, res) => {
  try {
    // URL 쿼리 파라미터에서 page와 limit 값을 가져옵니다.
    // page가 없으면 기본값 1, limit이 없으면 기본값 10을 사용합니다.
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    // 유효성 검사
    if (page < 1) {
      return res.status(400).json({ error: '페이지 번호는 1 이상이어야 합니다.' });
    }
    
    if (limit < 1 || limit > 100) {
      return res.status(400).json({ error: '한 페이지당 항목 수는 1에서 100 사이여야 합니다.' });
    }

    // 서비스 호출 시 page와 limit 전달
    const result = await boardService.getAllBoards(page, limit);
    
    // 응답 데이터 포맷팅 - 필요한 경우 여기에서 추가 가공 가능
    res.json(result);
  } catch (err) {
    console.error('게시글 목록 조회 오류:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * 게시글 검색 컨트롤러
 * @route GET /board/search
 * @query {string} keyword - 검색 키워드
 * @query {string} searchType - 검색 유형 (title, content, tag, all)
 * @query {number} page - 페이지 번호
 * @query {number} limit - 페이지당 항목 수
 */
exports.searchBoards = async (req, res) => {
  try {
    const { keyword, searchType = 'all' } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    // 검색어 유효성 검사
    if (!keyword || keyword.trim() === '') {
      return res.status(400).json({ 
        error: '검색어를 입력해주세요.' 
      });
    }
    
    // 페이지 관련 유효성 검사
    if (page < 1) {
      return res.status(400).json({ 
        error: '페이지 번호는 1 이상이어야 합니다.' 
      });
    }
    
    if (limit < 1 || limit > 100) {
      return res.status(400).json({ 
        error: '한 페이지당 항목 수는 1에서 100 사이여야 합니다.' 
      });
    }
    
    // 검색 타입 유효성 검사
    const validSearchTypes = ['title', 'content', 'tag', 'all'];
    if (!validSearchTypes.includes(searchType)) {
      return res.status(400).json({ 
        error: '유효하지 않은 검색 유형입니다. title, content, tag, all 중 하나여야 합니다.' 
      });
    }
    
    // 서비스 호출
    const searchParams = {
      keyword,
      searchType,
      page,
      limit
    };
    
    const result = await boardService.searchBoards(searchParams);
    res.json(result);
  } catch (err) {
    console.error('게시글 검색 오류:', err);
    res.status(500).json({ error: '게시글 검색 중 오류가 발생했습니다.' });
  }
};

exports.getBoard = async (req, res) => {
  try {
    const board = await boardService.getBoardById(req.params.id);
    if (!board) return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
    // 조회수 증가
    board.views += 1;
    await board.save();
    res.json(board);
  } catch (err) {
    console.error('게시글 상세 조회 오류:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getUserBoards = async (req, res) => {
  try {
    const { userId } = req.params;
    const boards = await boardService.getUserBoards(userId);
    if (!boards || boards.length === 0) {
      return res.status(404).json({
        message: "해당 사용자의 게시글이 없습니다."
      });
    }

    res.json(boards);
  } catch (err) {
    console.error('사용자 게시글 조회 오류:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteBoard = async (req, res) => {
  try {
    const result = await boardService.deleteBoard(req.params.id);
    if (!result) return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
