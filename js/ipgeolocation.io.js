// https://api.ipgeolocation.io/ipgeo?apiKey=f78d3a90fed645aeb5178b774c669b8d&ip=
// 키를 여러개 받아 랜덤으로 키를 대입해서 사용한다 
// 즉시 실행 함수를 사용하여 전역 스코프 오염을 방지합니다.
/*
<script>
  window.addEventListener('load', function() {
    // 'sf-ipgeolocation-sf-public_ip'를 원하는 컨테이너 ID
    window.sfIpGeolocationInit('sf-ipgeolocation-sf-public_ip');
  });
</script>
*/
// ipgeolocation.io.js

(function () {
    class sf_ipgeolocation_io {
        constructor(containerId) {
            // API 키 배열
            this.apiKeys = [
                'f78d3a90fed645aeb5178b774c669b8d',
                '7eea44e4d4f841cba90741b768bf33f3',
                'd375b90494964cc3a8fec570a263c5b0',
                '3aa8b50d0e2e436d9632511fdc804a00'
            ];

            // API 키 인덱스 (랜덤하게 선택)
            this.apiKeyIndex = Math.floor(Math.random() * this.apiKeys.length);

            // 컨테이너 ID (매개변수로 전달 받음)
            this.containerId = containerId;

            // 초기화 함수 호출
            this.init();
        }

        // 초기화 함수
        init() {
            // API 호출 및 결과 표시
            this.getPublicIP()
                .then(ip => {
                    this.displayIP(ip);
                })
                .catch(error => {
                    console.error('IP 주소 가져오기 오류:', error);
                    this.displayError('IP 주소를 가져오는 데 실패했습니다.'); // 에러 메시지 표시
                });
        }

        // ipgeolocation.io API를 사용하여 공용 IP 주소를 가져오는 함수
        async getPublicIP() {
            const apiKey = this.apiKeys[this.apiKeyIndex]; // 랜덤하게 선택된 API 키 사용
            const apiUrl = `https://api.ipgeolocation.io/getip?apiKey=${apiKey}`;

            try {
                const response = await fetch(apiUrl);

                if (!response.ok) {
                    throw new Error(`HTTP 오류! 상태: ${response.status}`);
                }

                const data = await response.json();
                return data.ip; // IP 주소 반환
            } catch (error) {
                console.error('API 요청 오류:', error);
                throw error; // 오류를 다시 던져서 상위에서 처리하도록 함
            }
        }


        // IP 주소를 HTML에 표시하는 함수
        displayIP(ip) {
            const container = document.getElementById(this.containerId);
            if (container) {
                container.textContent = ip; // IP 주소를 텍스트로 표시
            } else {
                console.error(`ID가 "${this.containerId}"인 요소를 찾을 수 없습니다.`);
            }
        }

        // 오류 메시지를 HTML에 표시하는 함수
        displayError(message) {
            const container = document.getElementById(this.containerId);
            if (container) {
                container.textContent = message; // 오류 메시지를 텍스트로 표시
            } else {
                console.error(`ID가 "${this.containerId}"인 요소를 찾을 수 없습니다.`);
            }
        }
    }


    // 페이지 로드 후 클래스를 직접 실행하는 대신,
    // 필요할 때 함수를 호출하여 실행하도록 변경합니다.
    window.sfIpGeolocationInit = function (containerId) {
        new sf_ipgeolocation_io(containerId);
    };
})();