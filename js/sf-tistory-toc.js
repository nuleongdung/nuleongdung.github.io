class sfTistoryToc {
    constructor() {
        this.tocContainerId = 'sf-tistory-toc';
        this.articleViewId = 'article-view'; // 글 본문
        this.headingsTargetClass = 'tt_article_useless_p_margin'; // 타겟 클래스
        this.tocWrapperClass = 'sf-toc-wrapper';
        this.tocListClass = 'sf-toc-list';
        this.tocItemClass = 'sf-toc-item';
        this.tocLinkClass = 'sf-toc-link';
        this.headingSelector = `#${this.articleViewId} h2, #${this.articleViewId} h3`;
        this.sfTocOpenClass = 'sfTocOpen';
        this.sfTocCloseClass = 'sfTocClose';

        this.init();
    }

    init() {
        // 'sf-toc-open' 클래스가 있는지 확인
        if (!document.querySelector('.sf-toc-open')) {
            console.error(".sf-toc-open  없음");
            return;
        }
        // TOC 컨테이너 생성 및 삽입
        if (this.createTocContainer()) {
            // 목차 생성
            this.generateToc();
        }
    }

    createTocContainer() {
        const contentInner = document.querySelector('#content .inner');

        if (!contentInner) {
            // console.error('TOC를 삽입할 위치를 찾을 수 없습니다: #content .inner');
            return;
        }

        const tocContainer = document.createElement('div');
        tocContainer.id = this.tocContainerId; // this.tocContainerId = 'sf-tistory-toc';
        contentInner.appendChild(tocContainer);
        return true; // 성공 시 true 반환
    }

    generateToc() {
        const articleView = document.getElementById(this.articleViewId);

        // articleView 요소를 찾을 수 없는 경우 오류를 출력하고 TOC 생성을 중단합니다.
        if (!articleView) {
            console.error('articleView 를 찾을 수 없습니다.');
            return false;
        }

        // articleView 요소 안에서 첫 번째로 발견되는 headingsTargetClass 클래스를 가진 요소 선택
        const headingsTarget = articleView.querySelector(`.${this.headingsTargetClass}`);

        // headingsTarget 요소를 찾을 수 없는 경우 오류를 출력하고 TOC 생성을 중단합니다.
        if (!headingsTarget) {
            console.error(`articleView 안에 ${this.headingsTargetClass} 클래스를 가진 요소를 찾을 수 없습니다.`);
            return false;
        }

        // headingsTarget 요소 내의 h2, h3, h4 태그를 모두 선택합니다.
        let headings = headingsTarget.querySelectorAll('h2, h3, h4');

        // headings 배열에 요소가 없는 경우 경고를 출력하고 TOC 생성을 중단합니다.
        if (headings.length === 0) {
            console.warn('article-view안에 h1, h2, h3, h4 태그가 없습니다.');
            return false;
        }


        // headings 배열의 마지막 값을 제거. 마지막에 빈값이 하나 더 들어간다 
        if (headings.length > 0) {
            // 마지막 요소를 제외한 나머지 요소만으로 새로운 NodeList 생성
            headings = Array.from(headings).slice(0, headings.length - 1);
        }

        // TOC 목록을 담을 ul 요소를 생성하고 클래스를 추가합니다.
        const tocList = document.createElement('ul');
        tocList.classList.add(this.tocListClass);


        // headings 배열을 계층 구조로 변환합니다.
        const structuredHeadings = this.structureHeadings(headings);

        // 계층 구조를 기반으로 TOC 목록을 생성합니다.
        this.generateTocList(structuredHeadings, tocList);

        // tocList 맨 위에 "목차" div를 sf-toc-title 추가합니다. h1의 text 내용
        let tocTitle = document.createElement('div');
        tocTitle.className = "sf-toc-title";
        tocTitle.textContent = "목차"; // 기본 텍스트 내용 설정
        tocList.insertBefore(tocTitle, tocList.firstChild);

        const h1Elements = articleView.querySelectorAll('h1');

        // h1Elements가 비어있지 않은 경우에만 첫 번째 노드를 가져옴
        if (h1Elements.length > 0) {
            const firstH1 = h1Elements[0];
            // firstH1 변수에 첫 번째 h1 요소가 저장됩니다.
            // 예: console.log(firstH1.textContent);
            tocTitle.textContent = firstH1.textContent;
        } else {
            // h1 요소가 없는 경우 처리
            // console.warn('articleView 안에 h1 태그가 없습니다.');
            // tocTitle.textContent = "목차"; // 기본 텍스트 내용은 이미 설정되어 있으므로 제거
        }






        const tocContainer = document.getElementById(this.tocContainerId);
        if (tocContainer) {
            tocContainer.appendChild(tocList);

            // tocList에 클릭 이벤트 리스너 추가
            this.attachTocEventListener(tocList);
        }

        return true;
    }
    // tocList에 클릭 이벤트 리스너를 부착하는 함수
    attachTocEventListener(tocList) {
        tocList.addEventListener('click', (event) => {
            const target = event.target;

            // 클릭된 요소가 sf-toc-item 클래스를 가지고 있는지 확인합니다.
            if (target.classList.contains('sf-toc-item')) {
                const sfIdx = target.dataset.sfIdx;

                // sfIdx 값이 존재하는지 확인합니다.
                if (sfIdx) {
                    // 해당 sfIdx를 가진 헤딩 요소로 스크롤 이동
                    const heading = document.querySelector(`[data-sftocid="${sfIdx}"]`);

                    // 헤딩 요소를 찾을 수 있는 경우
                    if (heading) {
                        // 300px 아래로 스크롤하는 새로운 방식
                        const offset = 300;
                        const elementPosition = heading.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - offset;

                        window.scrollTo({
                            top: offsetPosition,
                            behavior: "smooth"
                        });
                    }
                }
            }

            // 클릭된 요소가 sf-toc-toggle 클래스를 가지고 있는지 확인합니다.
            if (target.classList.contains('sf-toc-toggle')) {
                const h2Item = target.closest('.sf-toc-item'); // 가장 가까운 상위 sf-toc-item 찾기
                if (h2Item) {
                    const subList = h2Item.querySelector('ul'); // 하위 ul 요소 찾기
                    if (subList) {
                        // 하위 ul 요소의 display 속성을 토글합니다.
                        subList.style.display = subList.style.display === 'none' ? 'block' : 'none';

                        // 토글 버튼의 클래스 이름을 변경합니다.
                        if (subList.style.display === 'none') {
                            target.classList.remove(this.sfTocOpenClass);
                            target.classList.add(this.sfTocCloseClass);
                        } else {
                            target.classList.remove(this.sfTocCloseClass);
                            target.classList.add(this.sfTocOpenClass);
                        }
                        target.textContent = '';
                    }
                }
                event.stopPropagation(); // 이벤트 버블링을 막습니다.
            }
        });
    }

    /**
     * headings 배열을 계층 구조로 변환하는 함수
     * @param {NodeList} headings - h1, h2, h3, h4 요소의 NodeList
     * @returns {Array} - 계층 구조로 변환된 headings 배열
     *
     * 사용 예시:
     * const headings = document.querySelectorAll('h2, h3, h4');
     * const structuredHeadings = this.structureHeadings(headings);
     *
     * 출력 모델:
     * [
     *   {
     *     element: h2 요소,
     *     children: [
     *       {
     *         element: h3 요소,
     *         children: [
     *           {
     *             element: h4 요소,
     *             children: []
     *           }
     *         ]
     *       }
     *     ]
     *   },
     *   {
     *     element: h2 요소,
     *     children: []
     *   }
     * ]
     */
    structureHeadings(headings) {
        const structuredHeadings = [];
        let currentH2 = null;
        let currentH3 = null;
        // console.log(headings); // 불필요한 console.log() 제거
        headings.forEach(heading => {
            if (heading.tagName === 'H2') {
                currentH2 = {
                    element: heading,
                    children: []
                };
                structuredHeadings.push(currentH2);
                currentH3 = null;
            } else if (heading.tagName === 'H3' && currentH2) {
                currentH3 = {
                    element: heading,
                    children: []
                };
                currentH2.children.push(currentH3);
            } else if (heading.tagName === 'H4' && currentH3) {
                currentH3.children.push({
                    element: heading,
                    children: []
                });
            }
        });

        return structuredHeadings;
    }

    /**
     * 계층 구조를 기반으로 TOC 목록을 생성하는 재귀 함수
     * @param {Array} structuredHeadings - 계층 구조로 변환된 headings 배열
     * @param {HTMLElement} parentElement - TOC 목록을 추가할 부모 요소
     * @param {string} parentIndex - 부모 요소의 data-sf-idx 값
     *
     * 사용 예시:
     * const tocList = document.createElement('ul');
     * this.generateTocList(structuredHeadings, tocList);
     */
    generateTocList(structuredHeadings, parentElement, parentIndex = '') {
        structuredHeadings.forEach((heading, index) => {
            const currentIndex = parentIndex ? `${parentIndex}-${index + 1}` : (index + 1).toString();

            // data-sftocid 설정
            heading.element.dataset.sftocid = currentIndex;

            const listItem = document.createElement('li');
            listItem.classList.add(this.tocItemClass);
            listItem.dataset.sfIdx = currentIndex;

            // 자식 요소가 없는 경우 토글 버튼 생성하지 않음
            let toggleButton = null;
            if (heading.children.length > 0) {
                toggleButton = document.createElement('span');
                toggleButton.classList.add('sf-toc-toggle');
                toggleButton.classList.add(this.sfTocCloseClass);
                toggleButton.textContent = ''; // 초기에는 닫힌 상태로 표시
                listItem.appendChild(toggleButton);
            }

            listItem.append(heading.element.textContent); // 텍스트 내용 뒤에 추가

            parentElement.appendChild(listItem);

            // 자식 노드가 있는 경우 재귀적으로 목록 생성
            if (heading.children.length > 0) {
                const subList = document.createElement('ul');
                listItem.appendChild(subList);
                this.generateTocList(heading.children, subList, currentIndex);
                subList.style.display = 'none'; // 초기에는 닫힌 상태로 설정
            }
        });
    }

}

// 페이지 로드 후 TOC 생성
document.addEventListener('DOMContentLoaded', () => {
    new sfTistoryToc();
});