/**
 * SfOpenSourceBrowsers 클래스
 * XML 데이터를 로드하여 오픈 소스 브라우저 목록을 표시하는 기능을 제공합니다.
 */
class SfOpenSourceBrowsers {
    /**
     * 생성자
     * @param {string} containerId 브라우저 목록을 표시할 HTML 컨테이너의 ID
     */
    constructor(containerId) {
        this.containerId = containerId; // 컨테이너 ID 저장
        this.browsers = []; // 브라우저 데이터를 저장할 배열 초기화
        this.loadXml('https://nuleongdung.github.io/data/20-open-source-browsers.xml'); // XML 데이터 로드
    }

    /**
     * XML 파일을 비동기적으로 로드합니다.
     * @param {string} url XML 파일의 URL
     */
    async loadXml(url) {
        try {
            const response = await fetch(url); // XML 파일 가져오기
            const xmlText = await response.text(); // XML 데이터를 텍스트로 변환
            const parser = new DOMParser(); // XML 파서 생성
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml'); // XML 텍스트를 XML 문서로 파싱
            this.parseXml(xmlDoc); // XML 데이터 파싱
            this.render(); // 브라우저 목록 렌더링
        } catch (error) {
            console.error('XML 파일 로딩 오류:', error); // 오류 메시지 콘솔에 출력
            document.getElementById(this.containerId).innerText = 'XML 파일 로딩 실패.'; // 컨테이너에 오류 메시지 표시
        }
    }

    /**
     * XML 문서를 파싱하여 브라우저 데이터를 추출합니다.
     * @param {XMLDocument} xmlDoc 파싱할 XML 문서
     */
    parseXml(xmlDoc) {
        const browserNodes = xmlDoc.querySelectorAll('browser'); // 모든 'browser' 노드 선택
        browserNodes.forEach(browserNode => {
            // 각 브라우저 노드에서 데이터 추출하여 브라우저 객체 생성 후 배열에 추가
            this.browsers.push({
                name: browserNode.querySelector('name').textContent, // 브라우저 이름
                description: browserNode.querySelector('description').textContent, // 브라우저 설명
                features: Array.from(browserNode.querySelectorAll('features')).map(feature => feature.textContent), // 브라우저 특징 목록
                download_url: browserNode.querySelector('download_url').textContent, // 다운로드 URL
                installation_url: browserNode.querySelector('installation_url').textContent, // 설치 URL
                git_url: browserNode.querySelector('git_url').textContent, // Git 저장소 URL
                git_clone_command: browserNode.querySelector('git_clone_command').textContent, // Git 클론 명령어
                os: Array.from(browserNode.querySelectorAll('os')).map(os => os.textContent), // 지원 운영체제 목록
                installation_size: browserNode.querySelector('installation_size').textContent, // 설치 크기
                programming_languages: Array.from(browserNode.querySelectorAll('programming_languages')).map(lang => lang.textContent) // 사용 언어 목록
            });
        });
    }

    /**
     * 브라우저 목록을 렌더링합니다.
     */
    render() {
        const container = document.getElementById(this.containerId); // 컨테이너 요소 가져오기
        container.innerHTML = ''; // 컨테이너 내용 초기화
        this.browsers.forEach(browser => {
            const card = this.createCard(browser); // 각 브라우저에 대한 카드 생성
            container.appendChild(card); // 컨테이너에 카드 추가
        });
    }

    /**
     * 브라우저 데이터로부터 카드 요소를 생성합니다.
     * @param {object} browser 브라우저 데이터 객체
     * @returns {HTMLDivElement} 생성된 카드 요소
     */
    createCard(browser) {
        const card = document.createElement('div'); // 카드 요소 생성
        card.classList.add('sf-browser-card-bws'); // 카드 클래스 추가

        const header = document.createElement('div'); // 헤더 요소 생성
        header.classList.add('sf-card-header-bws'); // 헤더 클래스 추가
        header.textContent = browser.name; // 헤더 텍스트 설정
        card.appendChild(header); // 카드에 헤더 추가

        const content = document.createElement('div'); // 내용 요소 생성
        content.classList.add('sf-card-content-bws'); // 내용 클래스 추가

        const description = document.createElement('p'); // 설명 요소 생성
        description.textContent = browser.description; // 설명 텍스트 설정
        content.appendChild(description); // 내용에 설명 추가

        const featuresList = document.createElement('ul'); // 특징 목록 요소 생성
        featuresList.classList.add('sf-features-list-bws'); // 특징 목록 클래스 추가
        browser.features.forEach(feature => {
            const li = document.createElement('li'); // 목록 아이템 생성
            li.textContent = feature; // 목록 아이템 텍스트 설정
            featuresList.appendChild(li); // 특징 목록에 아이템 추가
        });
        content.appendChild(featuresList); // 내용에 특징 목록 추가

        const osList = document.createElement('ul'); // 운영체제 목록 요소 생성
        osList.classList.add('sf-os-list-bws'); // 운영체제 목록 클래스 추가
        browser.os.forEach(os => {
            const li = document.createElement('li'); // 목록 아이템 생성
            li.textContent = os; // 목록 아이템 텍스트 설정
            osList.appendChild(li); // 운영체제 목록에 아이템 추가
        });
        content.appendChild(osList); // 내용에 운영체제 목록 추가

        const languagesList = document.createElement('ul'); // 사용 언어 목록 요소 생성
        languagesList.classList.add('sf-languages-list-bws'); // 사용 언어 목록 클래스 추가
        browser.programming_languages.forEach(lang => {
            const li = document.createElement('li'); // 목록 아이템 생성
            li.textContent = lang; // 목록 아이템 텍스트 설정
            languagesList.appendChild(li); // 사용 언어 목록에 아이템 추가
        });
        content.appendChild(languagesList); // 내용에 사용 언어 목록 추가

        const downloadLink = document.createElement('a'); // 다운로드 링크 요소 생성
        downloadLink.href = browser.download_url; // 다운로드 링크 URL 설정
        downloadLink.textContent = 'Download'; // 다운로드 링크 텍스트 설정
        downloadLink.classList.add('sf-download-link-bws'); // 다운로드 링크 클래스 추가
        content.appendChild(downloadLink); // 내용에 다운로드 링크 추가

        const installationLink = document.createElement('a'); // 설치 링크 요소 생성
        installationLink.href = browser.installation_url; // 설치 링크 URL 설정
        installationLink.textContent = 'Installation'; // 설치 링크 텍스트 설정
        installationLink.classList.add('sf-installation-link-bws'); // 설치 링크 클래스 추가
        content.appendChild(installationLink); // 내용에 설치 링크 추가

        const gitUrlLink = document.createElement('a'); // Git 저장소 링크 요소 생성
        gitUrlLink.href = browser.git_url; // Git 저장소 링크 URL 설정
        gitUrlLink.textContent = 'Git Repository'; // Git 저장소 링크 텍스트 설정
        gitUrlLink.classList.add('sf-git-link-bws'); // Git 저장소 링크 클래스 추가
        content.appendChild(gitUrlLink); // 내용에 Git 저장소 링크 추가

        const gitCloneCommandDiv = document.createElement('div'); // Git 클론 명령어 요소 생성
        gitCloneCommandDiv.classList.add('sf-git-clone-command-bws'); // Git 클론 명령어 클래스 추가
        gitCloneCommandDiv.textContent = browser.git_clone_command; // Git 클론 명령어 텍스트 설정

        const copyButton = document.createElement('button'); // 복사 버튼 요소 생성
        copyButton.textContent = 'Copy'; // 복사 버튼 텍스트 설정
        copyButton.classList.add('sf-copy-button-bws'); // 복사 버튼 클래스 추가
        copyButton.addEventListener('click', (event) => {
            this.copyToClipboard(browser.git_clone_command, copyButton); // 클릭 시 클립보드에 복사
            event.stopPropagation(); // 카드 선택 방지
        });

        const gitCloneContainer = document.createElement('div'); // Git 클론 컨테이너 요소 생성
        gitCloneContainer.style.display = 'flex'; // flexbox 레이아웃 사용
        gitCloneContainer.style.alignItems = 'center'; // 세로 방향으로 가운데 정렬
        gitCloneContainer.appendChild(gitCloneCommandDiv); // 컨테이너에 명령어 추가
        gitCloneContainer.appendChild(copyButton); // 컨테이너에 복사 버튼 추가

        content.appendChild(gitCloneContainer); // 내용에 Git 클론 컨테이너 추가

        card.appendChild(content); // 카드에 내용 추가

        // 카드 선택 효과
        card.addEventListener('mouseover', () => card.classList.add('sf-selected-bws')); // 마우스 오버 시 선택 클래스 추가
        card.addEventListener('mouseout', () => card.classList.remove('sf-selected-bws')); // 마우스 아웃 시 선택 클래스 제거

        return card; // 생성된 카드 요소 반환
    }

    /**
     * 텍스트를 클립보드에 복사하고, 버튼 텍스트를 변경하여 사용자에게 알립니다.
     * @param {string} text 클립보드에 복사할 텍스트
     * @param {HTMLButtonElement} button 클릭된 복사 버튼
     */
    copyToClipboard(text, button) {
        navigator.clipboard.writeText(text) // 텍스트를 클립보드에 복사
            .then(() => {
                button.textContent = 'Copied!'; // 버튼 텍스트 변경
                button.classList.add('sf-copied-bws'); // 복사 완료 클래스 추가
                setTimeout(() => {
                    button.textContent = 'Copy'; // 버튼 텍스트 복구
                    button.classList.remove('sf-copied-bws'); // 복사 완료 클래스 제거
                }, 2000); // 2초 후 복구
            })
            .catch(err => {
                console.error('클립보드 복사 실패:', err); // 오류 메시지 콘솔에 출력
                button.textContent = 'Copy 실패'; // 버튼 텍스트 변경
            });
    }
}

/**
 * 사용 예시:
 *
 * 1. HTML 파일에 <div id="sf-opensource-browsers-bws"></div> 요소를 추가합니다.
 * 2. JavaScript 파일에서 SfOpenSourceBrowsers 클래스의 인스턴스를 생성하고 실행합니다.
 *    예:
 *    document.addEventListener('DOMContentLoaded', () => {
 *        new SfOpenSourceBrowsers('sf-opensource-browsers-bws');
 *    });
 * 3. XML 파일의 URL을 loadXml() 메서드에 전달하여 XML 데이터를 로드합니다.
 * 4. CSS 파일을 수정하여 웹 페이지의 디자인을 변경할 수 있습니다.
 */