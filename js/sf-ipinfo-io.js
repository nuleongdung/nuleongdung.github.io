// https://nuleongdung.github.io/js/sf-ipinfo-io.js

/**
 * @class sfIpinfoIo
 * @description ipinfo.io API를 사용하여 접속한 사용자의 IP 정보를 가져와 지정된 HTML 요소에 표시하는 클래스입니다.
 *              HTML 요소의 id를 매개변수로 받아 초기화하며, ipinfo.io API 토큰을 배열로 관리하고, 요청 시 랜덤하게 하나의 토큰을 선택하여 사용합니다.
 * @example
 * // HTML 파일에 다음 코드를 추가합니다.
 * // <div style="margin-top: 20px;" id="sf-ipinfo-result"></div>
 * // JavaScript 파일(https://nuleongdung.github.io/js/sf-ipinfo-io.js)을 HTML에 연결합니다.
 * // <script src="https://nuleongdung.github.io/js/sf-ipinfo-io.js"></script>
 *
 * // 웹 문서가 완전히 로드된 후 sfIpinfoIo 클래스를 실행합니다.
 * window.onload = function() {
 *   new sfIpinfoIo('sf-ipinfo-result'); // 'sf-ipinfo-result' id를 가진 요소를 찾아서 IP 정보를 표시합니다.
 * };
 */
class sfIpinfoIo {
    /**
     * @constructor
     * @param {string} elementId - IP 정보를 표시할 HTML 요소의 id입니다.
     */
    constructor(elementId) {
        // HTML 요소의 id를 클래스 멤버 변수에 저장합니다.
        this.elementId = elementId;

        /**
         * @property {string[]} tokens
         * @description ipinfo.io API 토큰을 배열로 저장합니다.
         * API 토큰은 ipinfo.io에서 발급받을 수 있으며, 요청 시 랜덤하게 하나를 선택하여 사용합니다.
         * @private
         */
        this.tokens = [
            '9ca14d793c4272',
            '4efed6ded4c74a',
            'b70aa5ecae338a',
            '1520c97d8a4150',
            'e4966872c17430',
            'b71e6ee05cd8f3'
        ];

        /**
         * @property {string} apiUrl
         * @description ipinfo.io API 기본 URL을 저장합니다.
         * API 요청 시 랜덤하게 선택된 토큰을 추가합니다.
         * @private
         */
        this.apiUrl = 'https://ipinfo.io?token=';

        // IP 정보를 가져와서 HTML 요소에 표시하는 메서드를 호출합니다.
        this.displayIpInfo();
    }

    /**
     * @method getRandomToken
     * @description API 요청 시 사용할 토큰을 랜덤하게 선택합니다.
     * @returns {string} - 랜덤하게 선택된 API 토큰
     * @private
     */
    getRandomToken() {
        // tokens 배열에서 랜덤하게 토큰을 하나 선택하여 반환합니다.
        return this.tokens[Math.floor(Math.random() * this.tokens.length)];
    }

    /**
     * @async
     * @method getIpInfo
     * @description ipinfo.io API를 사용하여 IP 정보를 가져옵니다.
     * @returns {Promise<object|null>} - IP 정보 객체 또는 오류 발생 시 null
     * @private
     */
    async getIpInfo() {
        // API 요청 시 사용할 토큰을 랜덤하게 선택합니다.
        const token = this.getRandomToken();

        // API 요청 URL을 생성합니다.
        const url = this.apiUrl + token;

        try {
            // fetch()를 사용하여 ipinfo.io API에 요청을 보냅니다.
            const response = await fetch(url);

            // HTTP 응답 상태 코드가 200 OK가 아니면 오류를 발생시킵니다.
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // API 응답을 JSON 형식으로 파싱하여 반환합니다.
            return await response.json();
        } catch (error) {
            // 오류 발생 시 콘솔에 오류 메시지를 출력합니다.
            console.error('Error fetching IP info:', error);

            // 오류 발생 시 null을 반환합니다.
            return null;
        }
    }

    /**
     * @async
     * @method displayIpInfo
     * @description 가져온 IP 정보를 HTML 요소에 표시합니다.
     * @private
     */
    async displayIpInfo() {
        // getIpInfo()를 호출하여 IP 정보를 가져옵니다.
        const ipInfo = await this.getIpInfo();

        // IP 정보를 표시할 HTML 요소를 찾습니다.
        const resultElement = document.getElementById(this.elementId);

        // HTML 요소가 존재하면
        if (resultElement) {
            // IP 정보를 가져오는 데 성공했으면
            if (ipInfo) {
                // IP 정보를 HTML 형식으로 만들어 요소의 innerHTML 속성에 할당합니다.
                resultElement.innerHTML = `
                    <p>IP Address: ${ipInfo.ip}</p>
                    <p>City: ${ipInfo.city}</p>
                    <p>Region: ${ipInfo.region}</p>
                    <p>Country: ${ipInfo.country}</p>
                    <p>Location: ${ipInfo.loc}</p>
                    <p>Organization: ${ipInfo.org}</p>
                    <p>Postal Code: ${ipInfo.postal}</p>
                    <p>Timezone: ${ipInfo.timezone}</p>
                `;

                // 스타일 적용을 위한 클래스를 추가합니다.
                resultElement.classList.add('sf-ipinfo-result');
            } else {
                // IP 정보를 가져오는 데 실패했으면 오류 메시지를 표시합니다.
                resultElement.innerHTML = '<p>Failed to retrieve IP information.</p>';
            }
        } else {
            // HTML 요소를 찾지 못하면 콘솔에 오류 메시지를 출력합니다.
            console.error(`Element with id "${this.elementId}" not found.`);
        }
    }
}