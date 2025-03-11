/**
 * 공용 IP 주소를 가져와 웹 페이지의 특정 요소에 표시하는 클래스
 */
class SfPublicIpFetcher {
    /**
     * @param {string} elementId - IP 주소를 표시할 HTML 요소의 ID
     */
    constructor(elementId) {
        this.elementId = elementId; // 전달받은 ID를 클래스 속성으로 저장
    }

    /**
     * 공용 IP 주소를 API에서 가져오는 비동기 함수
     */
    async fetchPublicIp() {
        try {
            // API 호출 (JSON 형식으로 응답을 받음)
            const response = await fetch("https://api64.ipify.org?format=json");

            // 응답 데이터를 JSON 객체로 변환
            const data = await response.json();

            // 받아온 IP 주소를 화면에 업데이트
            this.updateIpElement(data.ip);
        } catch (error) {
            // API 요청이 실패하면 오류 메시지를 출력
            console.error("IP 주소 가져오기 실패:", error);
        }
    }

    /**
     * 가져온 IP 주소를 HTML 요소에 삽입하는 함수
     * @param {string} ip - 가져온 공용 IP 주소
     */
    updateIpElement(ip) {
        // 지정한 ID를 가진 요소 찾기
        const element = document.getElementById(this.elementId);

        if (element) {
            // 요소가 존재하면 IP 주소를 표시
            element.textContent = `공용 IP: ${ip}`;
        } else {
            // 요소를 찾지 못하면 콘솔에 오류 메시지 출력
            console.error(`ID '${this.elementId}' 요소를 찾을 수 없습니다.`);
        }
    }
}

// 브라우저가 완전히 로드된 후 실행
document.addEventListener("DOMContentLoaded", () => {
    // SfPublicIpFetcher 클래스의 인스턴스를 생성하고, 'sf-public_id' 요소를 사용하도록 설정
    const ipFetcher = new SfPublicIpFetcher("sf-public_id");

    // 공용 IP 가져오기 실행
    ipFetcher.fetchPublicIp();
});
