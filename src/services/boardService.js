const Board = require('../models/boardModel');
const User = require('../models/userModel');
const Profile = require('../models/profileModel');
const Comment = require('../models/commentModel');
const { Op } = require('sequelize');

exports.createBoard = async (data) => {
  return await Board.create(data);
};

exports.getAllBoards = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  
  // 전체 게시글 수 조회
  const totalCount = await Board.count();
  
  // 페이지네이션된 게시글 데이터 조회
  const boards = await Board.findAll({
    limit,
    offset,
    order: [['regdate', 'DESC']], // 최신순 정렬
    include: [
      {
        model: User,
        attributes: ['user_id', 'student_id'],
        include: [
          {
            model: Profile,
            attributes: ['user_name', 'nick_name', 'profile_image']
          }
        ]
      }
    ]
  });

  // 각 게시글별 댓글 개수 추가
  const boardIds = boards.map(b => b.board_id);
  const commentCounts = await Comment.findAll({
    attributes: ['board_id', [Board.sequelize.fn('COUNT', Board.sequelize.col('comment_id')), 'count']],
    where: { board_id: boardIds },
    group: ['board_id']
  });
  const countMap = {};
  commentCounts.forEach(row => {
    countMap[row.board_id] = parseInt(row.get('count'), 10);
  });
  boards.forEach(board => {
    board.dataValues.commentCount = countMap[board.board_id] || 0;
  });

  // 전체 페이지 수 계산
  const totalPages = Math.ceil(totalCount / limit);
  
  return {
    data: boards,
    total: totalCount,
    page: page,
    totalPages: totalPages
  };
};

exports.getBoardById = async (id) => {
  return await Board.findByPk(id, {
    include: [
      {
        model: User,
        attributes: ['user_id', 'student_id'],
        include: [
          {
            model: Profile,
            attributes: ['user_name', 'nick_name', 'profile_image']
          }
        ]
      }
    ]
  });
};

exports.getUserBoards = async (userId) => {
  return await Board.findAll({
    where: {
      writer_id: userId
    },
    order: [
      ['regdate', 'DESC']
    ],
    include: [
      {
        model: User,
        attributes: ['user_id', 'student_id'],
        include: [
          {
            model: Profile,
            attributes: ['user_name', 'nick_name', 'profile_image']
          }
        ]
      }
    ]
  });
};

exports.deleteBoard = async (id) => {
  const board = await Board.findByPk(id);
  if (!board) return null;
  await board.destroy();
  return true;
};

/**
 * 게시글 검색 함수
 * @param {Object} searchParams - 검색 매개변수
 * @param {string} searchParams.keyword - 검색 키워드
 * @param {string} searchParams.searchType - 검색 유형 (title, content, tag)
 * @param {number} searchParams.page - 페이지 번호
 * @param {number} searchParams.limit - 페이지당 항목 수
 * @returns {Object} 검색 결과와 페이지네이션 정보
 */
exports.searchBoards = async (searchParams) => {
  const { keyword, searchType = 'all', page = 1, limit = 10 } = searchParams;
  const offset = (page - 1) * limit;
  
  // 검색 조건 설정
  let whereCondition = {};
  
  if (keyword) {
    if (searchType === 'title') {
      whereCondition.title = { [Op.like]: `%${keyword}%` };
    } else if (searchType === 'content') {
      whereCondition.content = { [Op.like]: `%${keyword}%` };
    } else if (searchType === 'tag') {
      // tag는 JSON 배열로 저장된다고 가정
      whereCondition.tag = { [Op.like]: `%${keyword}%` };
    } else if (searchType === 'all') {
      // 제목, 내용, 태그 모두에서 검색
      whereCondition = {
        [Op.or]: [
          { title: { [Op.like]: `%${keyword}%` } },
          { content: { [Op.like]: `%${keyword}%` } },
          { tag: { [Op.like]: `%${keyword}%` } }
        ]
      };
    }
  }
  
  // 검색 결과 수 조회
  const totalCount = await Board.count({ where: whereCondition });
  
  // 검색 결과 조회
  const boards = await Board.findAll({
    where: whereCondition,
    limit,
    offset,
    order: [['regdate', 'DESC']],
    include: [
      {
        model: User,
        attributes: ['user_id', 'student_id'],
        include: [
          {
            model: Profile,
            attributes: ['user_name', 'nick_name', 'profile_image']
          }
        ]
      }
    ]
  });
  
  // 전체 페이지 수 계산
  const totalPages = Math.ceil(totalCount / limit);
  
  return {
    data: boards,
    total: totalCount,
    page: page,
    totalPages: totalPages,
    keyword: keyword,
    searchType: searchType
  };
};
