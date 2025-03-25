/**
 * 파일명 : sf-sanitizeXMPData.js
 * sfSanitizeXMPData 클래스
 * XMP 데이터 소독 관련 기능을 제공합니다.
 * XMP 데이터 내 악성 코드를 제거합니다.
 */
class sfSanitizeXMPData {
    /**
     * 생성자
     */
    constructor() { }

    /**
     * XMP 데이터 소독 함수
     * XMP 데이터 내 악성 코드를 제거합니다.
     * @param {string} xmpData XMP 데이터
     * @returns {string} 소독된 XMP 데이터
     */
    sanitize(xmpData) {
        // 1. HTML 태그 제거
        let sanitizedData = xmpData.replace(/<[^>]*>/g, '');

        // 2. JavaScript 코드 실행을 막기 위한 문자 치환
        sanitizedData = sanitizedData.replace(/javascript:/gi, 'java script:');
        sanitizedData = sanitizedData.replace(/vbscript:/gi, 'vb script:');
        sanitizedData = sanitizedData.replace(/data:/gi, 'data :');

        // 3. 특수 문자 인코딩 (XSS 방지)
        sanitizedData = sanitizedData.replace(/&/g, '&amp;');
        sanitizedData = sanitizedData.replace(/</g, '&lt;');
        sanitizedData = sanitizedData.replace(/>/g, '&gt;');
        sanitizedData = sanitizedData.replace(/"/g, '&quot;');
        sanitizedData = sanitizedData.replace(/'/g, '&#39;');

        // 4. CDATA 섹션 제거 (CDATA 섹션 내에 악성 코드가 포함될 수 있음)
        sanitizedData = sanitizedData.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1');

        return sanitizedData;
    }
}