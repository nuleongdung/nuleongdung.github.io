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
        this.containerId = containerId;
        this.browsers = [];
        this.osFilters = ['Windows', 'macOS', 'Linux', 'Android'];
        this.languageFilters = ['C', 'C++', 'Go', 'Common Lisp', 'Python', 'Rust', '[C++, Qt]', '[C, Vala]', '[C, Lua]'];
        this.selectedOsFilters = new Set();
        this.selectedLanguageFilters = new Set();
        this.loadXml('https://nuleongdung.github.io/data/20-open-source-browsers.xml');
    }

    /**
     * XML 파일을 비동기적으로 로드합니다.
     * @param {string} url XML 파일의 URL
     */
    async loadXml(url) {
        try {
            const response = await fetch(url);
            const xmlText = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
            this.parseXml(xmlDoc);
            this.renderFilters();
            this.render();
        } catch (error) {
            console.error('XML 파일 로딩 오류:', error);
            document.getElementById(this.containerId).innerText = 'XML 파일 로딩 실패.';
        }
    }

    /**
     * XML 문서를 파싱하여 브라우저 데이터를 추출합니다.
     * @param {XMLDocument} xmlDoc 파싱할 XML 문서
     */
    parseXml(xmlDoc) {
        const browserNodes = xmlDoc.querySelectorAll('browser');
        this.browsers = Array.from(browserNodes).map(browserNode => {
            return {
                name: browserNode.querySelector('name').textContent,
                description: browserNode.querySelector('description').textContent,
                features: Array.from(browserNode.querySelectorAll('features')).map(feature => feature.textContent),
                download_url: browserNode.querySelector('download_url').textContent,
                installation_url: browserNode.querySelector('installation_url').textContent,
                git_url: browserNode.querySelector('git_url').textContent,
                git_clone_command: browserNode.querySelector('git_clone_command').textContent,
                os: Array.from(browserNode.querySelectorAll('os')).map(os => os.textContent),
                installation_size: browserNode.querySelector('installation_size').textContent,
                programming_languages: Array.from(browserNode.querySelectorAll('programming_languages')).map(lang => lang.textContent)
            };
        });
    }

    /**
     * 필터 옵션을 렌더링합니다.
     */
    renderFilters() {
        const container = document.getElementById(this.containerId);
        const filterOptionsContainer = document.getElementById('sf-filter-options-bws');

        // 기존 필터 버튼 삭제
        filterOptionsContainer.innerHTML = `
            <div id="sf-os-filters-bws">
                <h3>운영체제</h3>
            </div>
            <div id="sf-language-filters-bws">
                <h3>소스 언어</h3>
            </div>
        `;

        const osFiltersContainer = document.getElementById('sf-os-filters-bws');
        const languageFiltersContainer = document.getElementById('sf-language-filters-bws');

        // 운영체제 필터 렌더링
        this.osFilters.forEach(os => {
            const button = document.createElement('button');
            button.textContent = os;
            button.classList.toggle('sf-selected-filter-bws', this.selectedOsFilters.has(os)); // 초기 선택 상태 반영

            button.addEventListener('click', () => {
                if (this.selectedOsFilters.has(os)) {
                    this.selectedOsFilters.delete(os);
                } else {
                    this.selectedOsFilters.add(os);
                }
                button.classList.toggle('sf-selected-filter-bws');
                this.render();
            });
            osFiltersContainer.appendChild(button);
        });

        // 빌드 언어 필터 렌더링
        this.languageFilters.forEach(lang => {
            const button = document.createElement('button');
            button.textContent = lang;
            button.classList.toggle('sf-selected-filter-bws', this.selectedLanguageFilters.has(lang)); // 초기 선택 상태 반영

            button.addEventListener('click', () => {
                if (this.selectedLanguageFilters.has(lang)) {
                    this.selectedLanguageFilters.delete(lang);
                } else {
                    this.selectedLanguageFilters.add(lang);
                }
                button.classList.toggle('sf-selected-filter-bws');
                this.render();
            });
            languageFiltersContainer.appendChild(button);
        });

        container.appendChild(filterOptionsContainer);
    }

    /**
     * 브라우저 목록을 렌더링합니다.
     */
    render() {
        const browserListContainer = document.getElementById('sf-browser-list-bws');

        // 기존 목록 삭제
        browserListContainer.innerHTML = '';

        // 필터링된 브라우저 목록 생성
        let filteredBrowsers = this.browsers.filter(browser => {
            const osMatch = this.selectedOsFilters.size === 0 || browser.os.some(os => this.selectedOsFilters.has(os));
            const languageMatch = this.selectedLanguageFilters.size === 0 || browser.programming_languages.some(lang => this.selectedLanguageFilters.has(lang));
            return osMatch && languageMatch;
        });

        // 정렬: 선택된 필터 우선, 나머지는 뒤로
        filteredBrowsers.sort((a, b) => {
            const aOsMatch = a.os.some(os => this.selectedOsFilters.has(os));
            const bOsMatch = b.os.some(os => this.selectedOsFilters.has(os));
            const aLanguageMatch = a.programming_languages.some(lang => this.selectedLanguageFilters.has(lang));
            const bLanguageMatch = b.programming_languages.some(lang => this.selectedLanguageFilters.has(lang));

            const aSelected = aOsMatch || aLanguageMatch;
            const bSelected = bOsMatch || bLanguageMatch;

            if (aSelected && !bSelected) return -1; // a가 선택되었고 b는 선택되지 않았으면 a를 앞으로
            if (!aSelected && bSelected) return 1; // b가 선택되었고 a는 선택되지 않았으면 b를 앞으로
            return 0; // 둘 다 선택되었거나 선택되지 않았으면 순서 변경 없음
        });

        // 필터링된 브라우저 목록을 순회하며 카드 생성
        filteredBrowsers.forEach(browser => {
            const card = this.createCard(browser);
            browserListContainer.appendChild(card);
        });
    }

    /**
     * 브라우저 데이터로부터 카드 요소를 생성합니다.
     * @param {object} browser 브라우저 데이터 객체
     * @returns {HTMLDivElement} 생성된 카드 요소
     */
    createCard(browser) {
        const card = document.createElement('div');
        card.classList.add('sf-browser-card-bws');

        const header = document.createElement('div');
        header.classList.add('sf-card-header-bws');
        header.textContent = browser.name;
        card.appendChild(header);

        const content = document.createElement('div');
        content.classList.add('sf-card-content-bws');

        const description = document.createElement('p');
        description.textContent = browser.description;
        content.appendChild(description);

        const featuresList = document.createElement('ul');
        featuresList.classList.add('sf-features-list-bws');
        browser.features.forEach(feature => {
            const li = document.createElement('li');
            li.textContent = feature;
            featuresList.appendChild(li);
        });
        content.appendChild(featuresList);

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
        const downloadLink = document.createElement('a');
        downloadLink.href = browser.download_url;
        downloadLink.textContent = 'Download';
        downloadLink.classList.add('sf-download-link-bws');
        downloadLink.target = '_blank';
        downloadLinkSpan.appendChild(downloadLink);
        content.appendChild(downloadLinkSpan);

        const installationLinkSpan = document.createElement('span');
        installationLinkSpan.classList.add('sf-link-span-bws');
        const installationLink = document.createElement('a');
        installationLink.href = browser.installation_url;
        installationLink.textContent = 'Installation';
        installationLink.classList.add('sf-installation-link-bws');
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

        card.appendChild(content);

        // 카드 선택 효과
        card.addEventListener('mouseover', () => card.classList.add('sf-selected-bws'));
        card.addEventListener('mouseout', () => card.classList.remove('sf-selected-bws'));

        return card;
    }

    /**
     * 텍스트를 클립보드에 복사하고, 버튼 텍스트를 변경하여 사용자에게 알립니다.
     * @param {string} text 클립보드에 복사할 텍스트
     * @param {HTMLButtonElement} button 클릭된 복사 버튼
     */
    copyToClipboard(text, button) {
        navigator.clipboard.writeText(text)
            .then(() => {
                button.textContent = 'Copied!';
                button.classList.add('sf-copied-bws');
                setTimeout(() => {
                    button.textContent = 'Copy';
                    button.classList.remove('sf-copied-bws');
                }, 2000);
            })
            .catch(err => {
                console.error('클립보드 복사 실패:', err);
                button.textContent = 'Copy 실패';
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