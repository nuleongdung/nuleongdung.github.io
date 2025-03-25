class sfGifSecurityScanner {
    constructor() {
        // 초기화 작업 (필요한 경우)
    }

    async analyzeGIF(buffer) { // buffer를 직접 받도록 변경
        return new Promise((resolve, reject) => { // reject는 사용하지 않으므로 제거 가능
            const header = new TextDecoder().decode(buffer.subarray(0, 6));

            const result = {
                success: true,
                validGIF: false,
                gifVersion: null,
                hasComment: false,
                commentContent: null,
                hasExtensionBlock: false,
                extensionBlockType: null,
                extensionBlockData: null,
                warnings: [],
                errors: [],
                headerInfo: header, // GIF 헤더 정보 추가
            };

            // 1. 매직 넘버 확인
            if (header === 'GIF87a' || header === 'GIF89a') {
                result.validGIF = true;
                result.gifVersion = header;
            } else {
                result.success = false;
                result.errors.push('유효하지 않은 GIF 헤더입니다. GIF 파일이 아닙니다.');
                result.reason = 'invalid_gif_header';
                resolve(result); // GIF 파일이 아니면 더 이상 분석하지 않음
                return;
            }

            let offset = 6; // 헤더 이후부터 분석

            while (offset < buffer.length) {
                const blockType = buffer[offset];

                switch (blockType) {
                    case 0x21: // Extension Block
                        result.hasExtensionBlock = true;
                        const extensionType = buffer[offset + 1];

                        switch (extensionType) {
                            case 0xF9: // Graphic Control Extension
                                result.extensionBlockType = 'Graphic Control Extension';
                                result.extensionBlockData = Array.from(buffer.subarray(offset + 2, offset + 8)); // 6 bytes
                                offset += 8;
                                break;
                            case 0xFE: // Comment Extension
                                result.hasComment = true;
                                result.extensionBlockType = 'Comment Extension';
                                const commentLength = buffer[offset + 2];
                                result.commentContent = new TextDecoder().decode(buffer.subarray(offset + 3, offset + 3 + commentLength));
                                offset += 3 + commentLength + 1;  // +1 for block terminator (0x00)
                                if (result.commentContent.includes('<script>') || result.commentContent.includes('javascript:')) {
                                    result.warnings.push('XSS 위험: 주석에 스크립트 관련 내용이 포함되어 있습니다.');
                                }
                                break;
                            case 0xFF: // Application Extension
                                result.extensionBlockType = 'Application Extension';
                                const applicationLength = buffer[offset + 2];
                                result.extensionBlockData = Array.from(buffer.subarray(offset + 3, offset + 3 + applicationLength));
                                offset += 3 + applicationLength + 1; // +1 for block terminator (0x00)
                                break;
                            default:
                                result.extensionBlockType = 'Unknown Extension';
                                result.extensionBlockData = 'Unknown data';
                                offset += 2;
                                break;
                        }
                        break;

                    case 0x3B: // Trailer
                        offset = buffer.length; // End of GIF data
                        break;

                    case 0x00: // 보통 이미지 데이터 시작 또는 블록 종료
                    default:
                        // 이미지 데이터 처리 (간단하게 넘김)
                        // 실제 이미지 데이터 구조 분석은 별도 라이브러리 필요
                        offset++;
                        break;
                }
            }
            resolve(result);
        });
    }
}