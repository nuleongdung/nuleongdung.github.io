// js 파일명: ../js/sf-images-Optimizer.js

// 드래그 앤 드롭 영역 및 관련 요소
const sfDropArea = document.getElementById('sf-drop-area');
const sfImageInput = document.getElementById('imageInput');
const sfImgsDiv = document.getElementById('sfimgs');

// 드래그 오버 이벤트 핸들러
sfDropArea.addEventListener('dragover', sfHandleDragOver);

function sfHandleDragOver(event) {
    event.preventDefault(); // 기본 동작 막기 (파일 열기 방지)
    sfDropArea.classList.add('highlight'); // 드래그 오버 시 스타일 변경
}

// 드래그 리브 이벤트 핸들러
sfDropArea.addEventListener('dragleave', sfHandleDragLeave);

function sfHandleDragLeave(event) {
    sfDropArea.classList.remove('highlight'); // 드래그 종료 시 스타일 제거
}

// 파일 드롭 이벤트 핸들러
sfDropArea.addEventListener('drop', sfHandleFileSelect);

function sfHandleFileSelect(event) {
    event.preventDefault(); // 기본 동작 막기 (파일 열기 방지)
    sfDropArea.classList.remove('highlight'); // 스타일 제거

    const files = event.dataTransfer.files; // 드롭된 파일 목록

    // 파일 처리 함수 호출
    sfHandleFiles(files);
}

// 파일 선택 이벤트 핸들러 (기존 input[type="file"] 사용)
sfImageInput.addEventListener('change', function (event) {
    const files = event.target.files; // 선택된 파일 목록

    // 파일 처리 함수 호출
    sfHandleFiles(files);
});

// 파일 처리 함수 (드래그 앤 드롭 및 파일 선택 시 공통으로 사용)
function sfHandleFiles(files) {
    // 기존 이미지 비우기
    sfImgsDiv.innerHTML = '';

    for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // 파일 타입 확인
        if (!file.type.startsWith('image/')) {
            console.warn('이미지 파일만 선택해주세요.');
            continue;
        }

        const reader = new FileReader();

        reader.onload = function (e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            sfImgsDiv.appendChild(img);
        }

        reader.readAsDataURL(file);
    }
}

// sfDropArea 클릭시 파일 선택 창 뜨도록
sfDropArea.addEventListener('click', function () {
    sfImageInput.click();
});