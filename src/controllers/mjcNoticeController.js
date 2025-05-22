const axios = require("axios");
const cheerio = require("cheerio");
const { MjcNotice } = require("../models");

// 명지전문대 공지사항 크롤링 및 저장
exports.crawlAndSaveNotices = async (req, res) => {
  try {
    const url = "https://www.mjc.ac.kr/bbs/data/list.do?menu_idx=66";
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const $ = cheerio.load(data);
    const rows = $("table.board_list tbody tr");
    
    let savedCount = 0;
    let existingCount = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = $(rows[i]);
      const titleTag = row.find("td.cell_type01 a");
      const title = titleTag.text().trim();
      const href = titleTag.attr("href");
      const fullUrl = "https://www.mjc.ac.kr" + href;

      // Sequelize findOrCreate 메서드 사용하여 중복 처리
      const [notice, created] = await MjcNotice.findOrCreate({
        where: { link: fullUrl },
        defaults: { title }
      });

      if (created) {
        savedCount++;
        console.log("✅ 저장됨:", title);
      } else {
        existingCount++;
        console.log("⚠️ 이미 존재함:", title);
      }
    }

    return res.status(200).json({
      message: "크롤링 완료",
      result: {
        saved: savedCount,
        existing: existingCount,
        total: rows.length
      }
    });
  } catch (error) {
    console.error("크롤링 오류:", error);
    return res.status(500).json({ 
      message: "크롤링 실패", 
      error: error.message 
    });
  }
};

// 모든 공지사항 조회
exports.getAllNotices = async (req, res) => {
  try {
    const notices = await MjcNotice.findAll({
      order: [['created_at', 'DESC']]
    });
    return res.status(200).json(notices);
  } catch (error) {
    console.error("공지사항 조회 오류:", error);
    return res.status(500).json({ 
      message: "공지사항 조회 실패", 
      error: error.message 
    });
  }
};

// 공지사항 상세 조회
exports.getNoticeById = async (req, res) => {
  try {
    const { id } = req.params;
    const notice = await MjcNotice.findByPk(id);
    
    if (!notice) {
      return res.status(404).json({ message: "공지사항을 찾을 수 없습니다." });
    }
    
    return res.status(200).json(notice);
  } catch (error) {
    console.error("공지사항 상세 조회 오류:", error);
    return res.status(500).json({ 
      message: "공지사항 상세 조회 실패", 
      error: error.message 
    });
  }
};

// 가장 최근 공지사항 가져오기
exports.getLatestNotices = async (req, res) => {
  try {
    const count = parseInt(req.query.count) || 5; // 기본값 5개
    
    const notices = await MjcNotice.findAll({
      order: [['created_at', 'DESC']],
      limit: count
    });
    
    return res.status(200).json(notices);
  } catch (error) {
    console.error("최근 공지사항 조회 오류:", error);
    return res.status(500).json({ 
      message: "최근 공지사항 조회 실패", 
      error: error.message 
    });
  }
}; 