const cron = require("node-cron");
const axios = require("axios");
const cheerio = require("cheerio");
const { MjcNotice } = require("../models");

// 명지전문대 공지사항 크롤링 및 DB 저장 함수
const crawlMjcNotices = async () => {
  try {
    console.log("📅 크롤링 작업 시작: 명지전문대 공지사항");
    
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
      }
    }

    console.log(`📊 크롤링 완료: 총 ${rows.length}개 항목, 새로 저장 ${savedCount}개, 이미 존재 ${existingCount}개`);
  } catch (error) {
    console.error("❌ 크롤링 오류:", error.message);
  }
};

// 크론 작업 초기화 함수
const initCronJobs = () => {
  // 매주 월요일 오전 9시 실행
  cron.schedule("0 9 * * 1", () => {
    console.log("📅 월요일 9시 - 크롤링 시작");
    crawlMjcNotices();
  });
  
  // 개발 환경에서는 서버 시작 시 바로 한 번 실행 (선택사항)
  if (process.env.NODE_ENV === "development") {
    console.log("🔧 개발 환경 감지 - 초기 크롤링 실행");
    crawlMjcNotices();
  }
  
  console.log("⏰ 크론 작업 설정 완료");
};

module.exports = {
  initCronJobs,
  crawlMjcNotices
}; 