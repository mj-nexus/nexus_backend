const { User, Profile } = require("../models");
exports.userRegister = async (data) => {
    return await User.create(data);
}
exports.profileRegister = async (data) => {
    return await Profile.create(data);
}
exports.existingUser = async (data) => {
    return await Profile.findOne(data);
}
exports.userLogin = async (data) => {
    // Profile 모델과 조인하여 사용자 및 프로필 정보를 함께 가져옴
    return await User.findOne({
        where: data.where,
        include: [{
            model: Profile,
            required: false  // LEFT OUTER JOIN
        }],
        attributes: { exclude: ['password'] } // 비밀번호 필드는 제외
    });
}
exports.getUserProfile = async () => {
    return await Profile.findAll();
}
exports.getUserProfilesById = async (data) => {
    const res = await User.findOne({
        where: data,
        include: [{
            model: Profile,
            required: false  // LEFT OUTER JOIN
        }],
        attributes: { 
            include: ['user_id', 'student_id', 'onlineStatus'], 
            exclude: ['password'] 
        }
    });
    return res;
}
/**
 * 유저 통합 검색 함수 (searchType 없이 keyword만)
 * @param {Object} searchParams - 검색 매개변수
 * @param {string} searchParams.keyword - 검색 키워드
 * @param {number} searchParams.page - 페이지 번호
 * @param {number} searchParams.limit - 페이지당 항목 수
 * @returns {Object} 검색 결과와 페이지네이션 정보
 */
exports.searchUsers = async (searchParams) => {
    const { keyword, page = 1, limit = 10 } = searchParams;
    const offset = (page - 1) * limit;
    const { Op } = require('sequelize');

    let whereUser = {};
    if (keyword) {
        whereUser = {
            [Op.or]: [
                { student_id: { [Op.like]: `%${keyword}%` } },
                { '$Profile.user_name$': { [Op.like]: `%${keyword}%` } },
                { '$Profile.nick_name$': { [Op.like]: `%${keyword}%` } },
                { '$Profile.email$': { [Op.like]: `%${keyword}%` } }
            ]
        };
    }

    const totalCount = await User.count({
        where: whereUser,
        include: [{ model: Profile, required: false }]
    });

    const users = await User.findAll({
        where: whereUser,
        include: [{ model: Profile, required: false }],
        limit,
        offset,
        attributes: { exclude: ['password'] },
        order: [[{ model: Profile, as: 'Profile' }, 'user_name', 'ASC']]
    });

    const totalPages = Math.ceil(totalCount / limit);

    return {
        data: users,
        total: totalCount,
        page,
        totalPages,
        keyword
    };
};

/**
 * 모든 사용자의 온라인 상태 조회
 * @returns {Array} 사용자 ID와 온라인 상태 목록
 */
exports.getUsersOnlineStatus = async () => {
    return await User.findAll({
        attributes: ['user_id', 'onlineStatus'],
        include: [{
            model: Profile,
            attributes: ['user_name', 'nick_name', 'profile_image'],
            required: false
        }]
    });
};
