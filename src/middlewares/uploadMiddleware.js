const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// 업로드 디렉토리 확인 및 생성
const createUploadsFolder = (folderPath) => {
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }
};

// 프로필 이미지 저장을 위한 디스크 스토리지 설정
const profileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/profile');
        createUploadsFolder(uploadDir);
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // 파일명 중복 방지를 위해 해시 생성
        const hash = crypto.createHash('md5')
            .update(file.originalname + Date.now().toString())
            .digest('hex');
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, hash + ext);
    }
});

// 이미지 파일만 업로드 허용
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg', 
        'image/jpg', 
        'image/png', 
        'image/gif',
        'image/webp'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('지원되지 않는 파일 형식입니다. JPEG, PNG, GIF, WEBP 형식만 업로드 가능합니다.'), false);
    }
};

// 프로필 이미지 업로드 미들웨어
const uploadProfileImage = multer({
    storage: profileStorage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB 용량 제한
    },
    fileFilter: fileFilter
}).single('profileImage'); // 'profileImage'는 클라이언트에서 보내는 필드명

// 미들웨어 래퍼 함수
const uploadProfileMiddleware = (req, res, next) => {
    uploadProfileImage(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // Multer 에러 처리
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ error: '파일 크기는 5MB를 초과할 수 없습니다.' });
            }
            return res.status(400).json({ error: err.message });
        } else if (err) {
            // 기타 에러 처리
            return res.status(400).json({ error: err.message });
        }
        
        // 에러가 없으면 다음 미들웨어로 진행
        next();
    });
};

module.exports = { uploadProfileMiddleware }; 