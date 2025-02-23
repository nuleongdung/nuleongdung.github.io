/**
 * SfOpenSourceBrowsers 클래스
 * XML 데이터를 로드하여 오픈 소스 브라우저 목록을 표시하고 필터링하는 기능을 제공합니다.
 */
class SfOpenSourceBrowsers {
    /**
     * 생성자
     * @param {string} containerId 브라우저 목록을 표시할 HTML 컨테이너의 ID
     */
    constructor(containerId) {
        this.containerId = containerId;  // 브라우저 목록이 표시될 HTML 요소의 ID를 저장합니다.
        this.browsers = [];              // 브라우저 데이터를 저장할 배열을 초기화합니다.
        this.languageFilters = ['C', 'C++', 'Go', 'Common Lisp', 'Python', 'Rust', 'C++, Qt', 'C, Vala', 'C, Lua']; // 필터링에 사용될 언어 목록을 정의합니다.
        this.selectedLanguageFilters = new Set();  // 선택된 언어 필터를 저장하는 Set을 초기화합니다. Set은 중복을 허용하지 않아 효율적인 관리가 가능합니다.
        this.loadXml('https://nuleongdung.github.io/data/20-open-source-browsers.xml'); // XML 데이터를 로드합니다.
    }

    /**
     * XML 파일을 비동기적으로 로드합니다.
     * @param {string} url XML 파일의 URL
     */
    async loadXml(url) {
        try {
            const response = await fetch(url);  // URL에서 XML 데이터를 가져옵니다.
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`); // HTTP 오류가 발생하면 에러를 던집니다.
            }
            const xmlText = await response.text(); // 응답에서 텍스트 데이터를 추출합니다.
            const parser = new DOMParser();  // XML 파서 객체를 생성합니다.
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml'); // 텍스트를 XML 문서로 파싱합니다.

            // XML 파싱 에러 체크
            const parserError = xmlDoc.querySelector('parsererror'); // XML 파싱 중 에러가 있는지 확인합니다.
            if (parserError) {
                console.error('XML 파싱 에러:', parserError.textContent);  // 콘솔에 에러 메시지를 출력합니다.
                document.getElementById(this.containerId).innerText = 'XML 파싱 에러 발생.'; // 컨테이너에 에러 메시지를 표시합니다.
                return; // 함수를 종료합니다.
            }

            this.parseXml(xmlDoc); // XML 데이터를 파싱합니다.
            this.renderAll();       // 필터 및 브라우저 목록을 렌더링합니다.
        } catch (error) {
            console.error('XML 파일 로딩 오류:', error); // 콘솔에 에러 메시지를 출력합니다.
            document.getElementById(this.containerId).innerText = 'XML 파일 로딩 실패.'; // 컨테이너에 에러 메시지를 표시합니다.
        }
    }

    /**
     * XML 문서를 파싱하여 브라우저 데이터를 추출합니다.
     * @param {XMLDocument} xmlDoc 파싱할 XML 문서
     */
    parseXml(xmlDoc) {
        try {
            const browserNodes = xmlDoc.querySelectorAll('browser');  // XML 문서에서 모든 'browser' 노드를 선택합니다.
            this.browsers = Array.from(browserNodes).map(browserNode => { // 각 'browser' 노드를 순회하면서 브라우저 객체를 생성합니다.
                try {
                    // 각 속성에 대해 null 체크 추가
                    const name = browserNode.querySelector('name')?.textContent || '';  // 브라우저 이름을 추출하고, null이면 빈 문자열을 사용합니다.
                    const description = browserNode.querySelector('description')?.textContent || ''; // 브라우저 설명을 추출하고, null이면 빈 문자열을 사용합니다.
                    const features = Array.from(browserNode.querySelectorAll('features')).map(feature => feature.textContent); // 특징 목록을 추출합니다.
                    const download_url = browserNode.querySelector('download_url')?.textContent || ''; // 다운로드 URL을 추출하고, null이면 빈 문자열을 사용합니다.
                    const installation_url = browserNode.querySelector('installation_url')?.textContent || ''; // 설치 URL을 추출하고, null이면 빈 문자열을 사용합니다.
                    const git_url = browserNode.querySelector('git_url')?.textContent || ''; // Git URL을 추출하고, null이면 빈 문자열을 사용합니다.
                    const git_clone_command = browserNode.querySelector('git_clone_command')?.textContent || ''; // Git 클론 명령어를 추출하고, null이면 빈 문자열을 사용합니다.
                    const os = Array.from(browserNode.querySelectorAll('os')).map(os => os.textContent); // 지원하는 OS 목록을 추출합니다.
                    const installation_size = browserNode.querySelector('installation_size')?.textContent || ''; // 설치 크기를 추출하고, null이면 빈 문자열을 사용합니다.
                    const programming_languages = Array.from(browserNode.querySelectorAll('programming_languages')).map(lang => lang.textContent); // 사용된 프로그래밍 언어 목록을 추출합니다.

                    return { // 브라우저 객체를 반환합니다.
                        name: name,
                        description: description,
                        features: features,
                        download_url: download_url,
                        installation_url: installation_url,
                        git_url: git_url,
                        git_clone_command: git_clone_command,
                        os: os,
                        installation_size: installation_size,
                        programming_languages: programming_languages
                    };
                } catch (innerError) {
                    console.error('Browser Node 처리 중 에러:', innerError);  // 콘솔에 에러 메시지를 출력합니다.
                    return null; // 에러 발생 시 해당 브라우저 노드는 건너뜀
                }
            }).filter(browser => browser !== null); // null인 브라우저는 필터링
        } catch (error) {
            console.error('XML 파싱 에러:', error); // 콘솔에 에러 메시지를 출력합니다.
            document.getElementById(this.containerId).innerText = 'XML 파싱 에러 발생.';  // 컨테이너에 에러 메시지를 표시합니다.
        }
    }

    /**
     * 필터 및 브라우저 목록을 렌더링합니다.
     */
    renderAll() {
        const container = document.getElementById(this.containerId);  // 브라우저 목록을 표시할 컨테이너 요소를 가져옵니다.
        container.innerHTML = '';  // 기존 내용을 비웁니다.

        // 필터 옵션 컨테이너 생성
        const filterOptionsContainer = document.createElement('div'); // 필터 옵션을 담을 컨테이너를 생성합니다.
        filterOptionsContainer.id = 'sf-filter-options-bws'; // 컨테이너의 ID를 설정합니다.
        filterOptionsContainer.innerHTML = `
            <div id="sf-language-filters-bws">
                <h3>소스 언어</h3>
            </div>
        `;  // 컨테이너에 HTML 내용을 추가합니다. 여기서는 언어 필터 영역을 만듭니다.
        container.appendChild(filterOptionsContainer); // 먼저 필터 옵션 컨테이너 추가

        const languageFiltersContainer = document.getElementById('sf-language-filters-bws');  // 언어 필터 컨테이너 요소를 가져옵니다.

        // 빌드 언어 필터 렌더링
        this.languageFilters.forEach(lang => { // 언어 필터 목록을 순회하면서 각 필터 버튼을 생성합니다.
            const button = document.createElement('button');  // 버튼 요소를 생성합니다.
            button.textContent = lang; // 버튼의 텍스트를 언어 이름으로 설정합니다.
            button.classList.toggle('sf-selected-filter-bws', this.selectedLanguageFilters.has(lang)); // 초기 선택 상태 반영

            button.addEventListener('click', () => { // 버튼 클릭 이벤트 리스너를 추가합니다.
                if (this.selectedLanguageFilters.has(lang)) { // 이미 선택된 언어인 경우
                    this.selectedLanguageFilters.delete(lang);  // 선택을 해제합니다.
                } else {
                    this.selectedLanguageFilters.add(lang); // 선택되지 않은 언어인 경우 선택합니다.
                }
                button.classList.toggle('sf-selected-filter-bws'); // 버튼의 CSS 클래스를 토글하여 선택 상태를 표시합니다.
                this.render(); // 브라우저 목록을 다시 렌더링합니다.
            });
            languageFiltersContainer.appendChild(button); // 언어 필터 컨테이너에 버튼을 추가합니다.
        });

        // 브라우저 목록 컨테이너 생성
        const browserListContainer = document.createElement('div');  // 브라우저 목록을 담을 컨테이너를 생성합니다.
        browserListContainer.id = 'sf-browser-list-bws'; // 컨테이너의 ID를 설정합니다.
        container.appendChild(browserListContainer); // 그 다음 브라우저 목록 컨테이너 추가

        this.render(); // 브라우저 목록을 렌더링합니다.
    }

    /**
     * 브라우저 목록을 렌더링합니다.
     */
    render() {
        const browserListContainer = document.getElementById('sf-browser-list-bws'); // 브라우저 목록 컨테이너 요소를 가져옵니다.

        // 기존 목록 삭제
        browserListContainer.innerHTML = ''; // 컨테이너의 기존 내용을 비웁니다.

        // 모든 브라우저를 가져옴
        const allBrowsers = [...this.browsers];

        // 정렬: 선택된 필터 우선, 나머지는 뒤로
        allBrowsers.sort((a, b) => {
            const aLanguageMatch = a.programming_languages.some(lang => this.isSelectedLanguage(a.programming_languages));
            const bLanguageMatch = b.programming_languages.some(lang => this.isSelectedLanguage(b.programming_languages));

            const aSelected = aLanguageMatch;
            const bSelected = bLanguageMatch;

            if (aSelected && !bSelected) return -1; // a가 선택되었고 b는 선택되지 않았으면 a를 앞으로
            if (!aSelected && bSelected) return 1; // b가 선택되었고 a는 선택되지 않았으면 b를 앞으로
            return 0; // 둘 다 선택되었거나 선택되지 않았으면 순서 변경 없음
        });

        // 필터링된 브라우저 목록을 순회하며 카드 생성
        allBrowsers.forEach(browser => {  // 브라우저 목록을 순회하면서 각 브라우저에 대한 카드 요소를 생성합니다.
            const card = this.createCard(browser);  // 브라우저 데이터를 기반으로 카드 요소를 생성합니다.

            const languageMatch = this.selectedLanguageFilters.size === 0 || this.isSelectedLanguage(browser.programming_languages);
            const isSelected = languageMatch;

            if (isSelected) {
                card.classList.remove('sf-unselected-bws');
                card.classList.add('sf-selected-bws');
            } else {
                card.classList.remove('sf-selected-bws');
                card.classList.add('sf-unselected-bws');
            }

            browserListContainer.appendChild(card);  // 브라우저 목록 컨테이너에 카드 요소를 추가합니다.
        });
    }

    /**
     * 브라우저의 언어 목록이 선택된 언어를 포함하는지 확인
     * @param {Array<string>} languages 브라우저의 언어 목록
     * @returns {boolean} 선택된 언어를 포함하면 true, 그렇지 않으면 false
     */
    isSelectedLanguage(languages) {
        if (this.selectedLanguageFilters.size === 0) return true;
        for (const selectedLang of this.selectedLanguageFilters) {
            if (languages.some(lang => lang.includes(selectedLang))) {
                return true;
            }
        }
        return false;
    }

    /**
     * 브라우저 데이터로부터 카드 요소를 생성합니다.
     * @param {object} browser 브라우저 데이터 객체
     * @returns {HTMLDivElement} 생성된 카드 요소
     */
    createCard(browser) {
        const card = document.createElement('div');  // 카드 요소를 생성합니다.
        card.classList.add('sf-browser-card-bws');  // 카드 요소에 CSS 클래스를 추가합니다.

        const header = document.createElement('div'); // 카드 헤더 요소를 생성합니다.
        header.classList.add('sf-card-header-bws'); // 헤더 요소에 CSS 클래스를 추가합니다.

        // 브라우저 이름과 "자세히" 버튼을 함께 표시할 컨테이너 생성
        const headerContent = document.createElement('div');
        headerContent.style.display = 'flex'; // flexbox 레이아웃 사용
        headerContent.style.justifyContent = 'space-between'; // 이름과 버튼을 양쪽 끝으로 정렬
        headerContent.style.alignItems = 'center'; // 수직 가운데 정렬
        headerContent.style.width = '100%';

        const browserNameSpan = document.createElement('span');
        browserNameSpan.textContent = browser.name;

        // "자세히" 버튼 생성
        const detailButton = document.createElement('a');
        detailButton.textContent = '자세히';
        detailButton.href = `#sf-${browser.name.toLowerCase().replace(/ /g, '-')}-info`; // 앵커 링크 설정
        detailButton.classList.add('sf-detail-button-bws'); // 버튼 스타일을 위한 클래스 추가

        headerContent.appendChild(browserNameSpan); // 이름 추가
        headerContent.appendChild(detailButton); // 버튼 추가
        header.appendChild(headerContent);

        card.appendChild(header);  // 카드 요소에 헤더 요소를 추가합니다.

        const content = document.createElement('div'); // 카드 내용 요소를 생성합니다.
        content.classList.add('sf-card-content-bws'); // 내용 요소에 CSS 클래스를 추가합니다.

        const description = document.createElement('p'); // 브라우저 설명 요소를 생성합니다.
        description.textContent = browser.description; // 설명 텍스트를 브라우저 설명으로 설정합니다.
        content.appendChild(description); // 카드 내용 요소에 설명 요소를 추가합니다.

        const featuresList = document.createElement('ul'); // 특징 목록 요소를 생성합니다.
        featuresList.classList.add('sf-features-list-bws'); // 목록 요소에 CSS 클래스를 추가합니다.
        browser.features.forEach(feature => { // 브라우저 특징 목록을 순회하면서 각 특징에 대한 목록 아이템을 생성합니다.
            const li = document.createElement('li'); // 목록 아이템 요소를 생성합니다.
            li.textContent = feature;  // 아이템 텍스트를 특징으로 설정합니다.
            featuresList.appendChild(li);  // 특징 목록에 아이템 요소를 추가합니다.
        });
        content.appendChild(featuresList); // 카드 내용 요소에 특징 목록 요소를 추가합니다.

        const osList = document.createElement('ul');
        osList.classList.add('sf-os-list-bws');
        browser.os.forEach(os => {
            const li = document.createElement('li');
            li.textContent = os;
            osList.appendChild(li);
        });
        content.appendChild(osList);

        const languagesList = document.createElement('ul');
        languagesList.classList.add('sf-languages-list-bws');
        browser.programming_languages.forEach(lang => {
            const li = document.createElement('li');
            li.textContent = lang;
            languagesList.appendChild(li);
        });
        content.appendChild(languagesList);

        // 링크 수정: span으로 묶음
        const downloadLinkSpan = document.createElement('span');
        downloadLinkSpan.classList.add('sf-link-span-bws');
        const downloadLink = document.createElement('a'); // 다운로드 링크 요소를 생성합니다.
        downloadLink.href = browser.download_url; // 링크의 URL을 다운로드 URL로 설정합니다.
        downloadLink.textContent = 'Download'; // 링크 텍스트를 'Download'로 설정합니다.
        downloadLink.classList.add('sf-download-link-bws'); // 링크 요소에 CSS 클래스를 추가합니다.
        downloadLink.target = '_blank'; // 새 탭에서 열도록 설정합니다.
        downloadLinkSpan.appendChild(downloadLink);
        content.appendChild(downloadLinkSpan); // 카드 내용 요소에 다운로드 링크 요소를 추가합니다.

        const installationLinkSpan = document.createElement('span');
        installationLinkSpan.classList.add('sf-link-span-bws');
        const installationLink = document.createElement('a');
        installationLink.href = browser.installation_url;
        installationLink.textContent = 'Installation';
        installationLink.classList.add('sf-download-link-bws');
        installationLink.target = '_blank';
        installationLinkSpan.appendChild(installationLink);
        content.appendChild(installationLinkSpan);

        const gitUrlLinkSpan = document.createElement('span');
        gitUrlLinkSpan.classList.add('sf-link-span-bws');
        const gitUrlLink = document.createElement('a');
        gitUrlLink.href = browser.git_url;
        gitUrlLink.textContent = 'Git Repository';
        gitUrlLink.classList.add('sf-git-link-bws');
        gitUrlLink.target = '_blank';
        gitUrlLinkSpan.appendChild(gitUrlLink);
        content.appendChild(gitUrlLinkSpan);

        const gitCloneCommandDiv = document.createElement('div');
        gitCloneCommandDiv.classList.add('sf-git-clone-command-bws');
        gitCloneCommandDiv.textContent = browser.git_clone_command;

        const copyButton = document.createElement('button');
        copyButton.textContent = 'Copy';
        copyButton.classList.add('sf-copy-button-bws');
        copyButton.addEventListener('click', (event) => {
            this.copyToClipboard(browser.git_clone_command, copyButton);
            event.stopPropagation();
        });

        const gitCloneContainer = document.createElement('div');
        gitCloneContainer.style.display = 'flex';
        gitCloneContainer.style.alignItems = 'center';
        gitCloneContainer.appendChild(gitCloneCommandDiv);
        gitCloneContainer.appendChild(copyButton);

        content.appendChild(gitCloneContainer);

        card.appendChild(content); // 카드 요소에 내용 요소를 추가합니다.

        // 카드 선택 효과
        card.addEventListener('mouseover', () => card.classList.add('sf-selected-bws'));  // 카드에 마우스가 올라갔을 때 선택 효과를 추가합니다.
        card.addEventListener('mouseout', () => card.classList.remove('sf-selected-bws')); // 카드에서 마우스가 벗어났을 때 선택 효과를 제거합니다.

        return card;  // 생성된 카드 요소를 반환합니다.
    }

    /**
     * 텍스트를 클립보드에 복사하고, 버튼 텍스트를 변경하여 사용자에게 알립니다.
     * @param {string} text 클립보드에 복사할 텍스트
     * @param {HTMLButtonElement} button 클릭된 복사 버튼
     */
    copyToClipboard(text, button) {
        navigator.clipboard.writeText(text) // 텍스트를 클립보드에 복사합니다.
            .then(() => {
                button.textContent = 'Copied!'; // 복사 성공 시 버튼 텍스트를 'Copied!'로 변경합니다.
                button.classList.add('sf-copied-bws');
                setTimeout(() => {
                    button.textContent = 'Copy'; // 2초 후 버튼 텍스트를 'Copy'로 되돌립니다.
                    button.classList.remove('sf-copied-bws');
                }, 2000);
            })
            .catch(err => {
                console.error('클립보드 복사 실패:', err); // 복사 실패 시 콘솔에 에러 메시지를 출력합니다.
                button.textContent = 'Copy 실패'; // 버튼 텍스트를 'Copy 실패'로 변경합니다.
            });
    }
}

/**
 *
 * 1. HTML 파일에 <div id="sf-opensource-browsers-bws"></div> 요소를 추가합니다.
 * 2. JavaScript 파일에서 SfOpenSourceBrowsers 클래스의 인스턴스를 생성하고 실행합니다.
 *    예:
 *    document.addEventListener('DOMContentLoaded', () => {
 *        new SfOpenSourceBrowsers('sf-opensource-browsers-bws');
 *    });
 * 3. XML 파일의 URL을 loadXml() 메서드에 전달하여 XML 데이터를 로드합니다.
 */