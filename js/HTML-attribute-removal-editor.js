// https://nuleongdung.github.io/js/HTML-attribute-removal-editor.js
class sfTistoryWebeditor {
    constructor() {
        this.editorTabBtn = document.getElementById('sf-editorTabBtn');
        this.sourceTabBtn = document.getElementById('sf-sourceTabBtn');
        this.removeCSSBtn = document.getElementById('sf-removeCSSBtn');
        this.editorTab = document.getElementById('sf-editorTab');
        this.webeditorIframe = document.getElementById('sf-webeditor-iframe');
        this.sourceTab = document.getElementById('sf-sourceTab');
        this.sourceCodeArea = document.getElementById('sf-sourceCodeArea');
        this.validationMessage = document.getElementById('sf-validationMessage');
        this.standardHtmlTags = [
            'a', 'abbr', 'address', 'area', 'article', 'aside', 'audio',
            'b', 'base', 'bdi', 'bdo', 'blockquote', 'body', 'br', 'button',
            'canvas', 'caption', 'cite', 'code', 'col', 'colgroup',
            'data', 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'div', 'dl', 'dt',
            'em', 'embed', 'fieldset', 'figcaption', 'figure', 'footer', 'form',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hr', 'html',
            'i', 'iframe', 'img', 'input', 'ins',
            'kbd', 'keygen',
            'label', 'legend', 'li', 'link',
            'main', 'map', 'mark', 'math', 'meter', 'meta',
            'nav', 'noscript',
            'object', 'ol', 'optgroup', 'option', 'output',
            'p', 'param', 'picture', 'pre', 'progress',
            'q',
            'rp', 'rt', 'ruby',
            's', 'samp', 'script', 'section', 'select', 'slot', 'small', 'source', 'span', 'strong', 'style', 'sub', 'summary', 'sup', 'svg',
            'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track',
            'u', 'ul',
            'var', 'video',
            'wbr'
        ];
        this.attributesToRemove = ['style', 'onclick', 'id', 'class', '_ngcontent-ng-c2459883256'];
        this.customTagReplacements = {
            'custom-tag-1': 'p',
            'custom-tag-2': 'div'
        };
        this.webeditor = null;
    }

    init() {
        this.editorTabBtn.addEventListener('click', () => this.showEditorTab());
        this.sourceTabBtn.addEventListener('click', () => this.showSourceTab());
        this.removeCSSBtn.addEventListener('click', () => this.removeNonStandardTags());

        // iframe 로드 완료 후 초기화
        this.webeditorIframe.onload = () => {
            try {
                // iframe 내부의 document 객체 가져오기
                const iframeDocument = this.webeditorIframe.contentDocument || this.webeditorIframe.contentWindow.document;

                // iframe 내부의 head 요소 가져오기
                const headElement = iframeDocument.head;

                // head 요소가 존재하는지 확인
                if (headElement) {
                    // head 요소 내부의 모든 자식 요소 제거
                    while (headElement.firstChild) {
                        headElement.removeChild(headElement.firstChild);
                    }

                    // title 요소 추가 (필요한 경우)
                    const titleElement = document.createElement('title');
                    titleElement.textContent = '웹 에디터';
                    headElement.appendChild(titleElement);
                } else {
                    console.error('<iframe> 내부의 <head> 요소에 접근할 수 없습니다.');
                }

                // iframe 내부의 body 요소 가져오기
                this.webeditor = iframeDocument.body;

                // body 요소가 존재하는지 확인
                if (this.webeditor) {
                    // contenteditable 속성 설정
                    this.webeditor.setAttribute('contenteditable', 'true');

                    // 초기 내용 설정
                    this.webeditor.innerHTML = '';

                    // 이벤트 리스너 연결
                    this.webeditor.addEventListener('input', () => this.updateSourceCode());
                } else {
                    console.error('<iframe> 내부의 <body> 요소에 접근할 수 없습니다.');
                }

                // 소스 코드 영역 업데이트
                this.updateSourceCode();
            } catch (error) {
                console.error('<iframe> 초기화 중 오류 발생:', error);
            }
        };

        // iframe src 설정 (현재 URL 사용)
        this.webeditorIframe.src = window.location.href;

        // 초기 로드 시 소스 코드 영역 업데이트
        this.updateSourceCode();

        // 웹 에디터 내용 변경 시 소스 코드 영역 업데이트
        if (this.webeditor) {
            this.webeditor.addEventListener('input', () => this.updateSourceCode());
        }
    }

    initIframeContent() {
        // 이 함수는 이제 필요하지 않으므로 제거하거나 주석 처리합니다.
    }

    showEditorTab() {
        this.editorTabBtn.classList.add('active');
        this.sourceTabBtn.classList.remove('active');
        this.editorTabBtn.setAttribute('aria-selected', 'true');
        this.sourceTabBtn.setAttribute('aria-selected', 'false');
        this.editorTabBtn.setAttribute('tabindex', '0');
        this.sourceTabBtn.setAttribute('tabindex', '-1');

        this.editorTab.classList.add('active');
        this.sourceTab.classList.remove('active');
        this.sourceTab.setAttribute('hidden', 'hidden');
        this.editorTab.removeAttribute('hidden');
    }

    showSourceTab() {
        this.sourceTabBtn.classList.add('active');
        this.editorTabBtn.classList.remove('active');
        this.editorTabBtn.setAttribute('aria-selected', 'false');
        this.sourceTabBtn.setAttribute('aria-selected', 'true');
        this.editorTabBtn.setAttribute('tabindex', '-1');
        this.sourceTabBtn.setAttribute('tabindex', '0');

        this.sourceTab.classList.add('active');
        this.editorTab.classList.remove('active');
        this.editorTab.setAttribute('hidden', 'hidden');
        this.sourceTab.removeAttribute('hidden');

        this.updateSourceCode();
    }

    removeAllAttributes(element) {
        this.attributesToRemove.forEach(attr => {
            element.removeAttribute(attr);
        });
    }

    replaceNonStandardTag(element) {
        let tagName = element.tagName.toLowerCase();
        let replacementTag = this.customTagReplacements[tagName] || 'span';
        let newElement = document.createElement(replacementTag);
        newElement.textContent = element.textContent;
        element.replaceWith(newElement);
    }

    removeNonStandardTags() {
        let tempDiv = document.createElement('div');
        tempDiv.innerHTML = this.webeditor.innerHTML;

        let allElements = tempDiv.querySelectorAll('*');
        allElements.forEach(element => {
            this.removeAllAttributes(element);
            let tagName = element.tagName.toLowerCase();
            if (!this.standardHtmlTags.includes(tagName)) {
                this.replaceNonStandardTag(element);
            }
        });

        this.webeditor.innerHTML = tempDiv.innerHTML;
        this.updateSourceCode();
    }

    updateSourceCode() {
        const iframeDocument = this.webeditorIframe.contentDocument || this.webeditorIframe.contentWindow.document;
        this.sourceCodeArea.textContent = iframeDocument.body.innerHTML;
    }
}