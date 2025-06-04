'use strict';

/**
 * Geminiメモファイル名から日時を抽出する
 * リネーム前: " 2025/06/05 00:24 JST に開始した会議 - Gemini によるメモ" (空白あり)
 * リネーム前: "2025/06/05 00:24 JST に開始した会議 - Gemini によるメモ" (空白なし)
 * リネーム後: "myv-fmvs-cvs - 2025/06/05 00:24 JST に開始した会議 - Gemini によるメモ"
 * → "2025/06/05 00:24"
 * 
 * @param {string} fileName - Geminiメモファイル名
 * @returns {string|null} - 抽出された日時文字列、失敗時はnull
 */
function extractDateTimeFromGemini(fileName) {
    // ファイル名の前後の空白をトリム
    const trimmedName = fileName.trim();
    
    // パターン1: リネーム後 - "meetId - YYYY/MM/DD HH:MM JST に開始した会議 - Gemini によるメモ"
    const renamedPattern = /^[a-z]{3}-[a-z]{4}-[a-z]{3}\s+-\s+(\d{4}\/\d{2}\/\d{2}\s+\d{2}:\d{2})\s+JST\s+に開始した会議\s+-\s+Gemini\s+によるメモ$/;
    
    let match = trimmedName.match(renamedPattern);
    if (match) {
        // console.log(`🔄 Found renamed Gemini pattern: ${match[1]}`);
        return match[1]; // 日時部分のみ返す
    }
    
    // パターン2: リネーム前 (空白なし) - "YYYY/MM/DD HH:MM JST に開始した会議 - Gemini によるメモ"
    const originalPatternNoSpace = /^(\d{4}\/\d{2}\/\d{2}\s+\d{2}:\d{2})\s+JST\s+に開始した会議\s+-\s+Gemini\s+によるメモ$/;
    
    match = trimmedName.match(originalPatternNoSpace);
    if (match) {
        // console.log(`📅 Found original Gemini pattern (no leading space): ${match[1]}`);
        return match[1]; // 日時部分のみ返す
    }
    
    // console.log(`❌ No Gemini pattern matched for: "${trimmedName}"`);
    // console.log(`🔍 Patterns tried:`);
    // console.log(`  1. Renamed: [a-z]{3}-[a-z]{4}-[a-z]{3} - YYYY/MM/DD...`);
    // console.log(`  2. Original: YYYY/MM/DD HH:MM JST...`);
    return null;
}

/**
 * 動画ファイル名から日時を抽出する
 * "myv-fmvs-cvs (2025-06-05 00:24 GMT+9)" → "2025-06-05 00:24"
 * 
 * @param {string} fileName - 動画ファイル名
 * @returns {string|null} - 抽出された日時文字列、失敗時はnull
 */
function extractDateTimeFromVideo(fileName) {
    // パターン: xxx-xxxx-xxx (YYYY-MM-DD HH:MM GMT+9)
    const videoPattern = /\((\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})\s+GMT\+9\)/;
    
    const match = fileName.match(videoPattern);
    if (match) {
        return match[1]; // 日時部分のみ返す
    }
    
    return null;
}

/**
 * 動画ファイル名からMeet IDを抽出する
 * "myv-fmvs-cvs (2025-06-05 00:24 GMT+9)" → "myv-fmvs-cvs"
 * 
 * @param {string} fileName - 動画ファイル名
 * @returns {string|null} - 抽出されたMeet ID、失敗時はnull
 */
function extractMeetIdFromVideo(fileName) {
    // パターン: xxx-xxxx-xxx (YYYY-MM-DD HH:MM GMT+9)
    const meetIdPattern = /^([a-z]{3}-[a-z]{4}-[a-z]{3})\s+\(/;
    
    const match = fileName.match(meetIdPattern);
    if (match) {
        return match[1]; // Meet ID部分のみ返す
    }
    
    return null;
}

/**
 * 日時文字列を正規化する（比較用）
 * "2025/06/05 00:24" → "2025-06-05 00:24"
 * "2025-06-05 00:24" → "2025-06-05 00:24"
 * 
 * @param {string} dateTimeStr - 日時文字列
 * @returns {string} - 正規化された日時文字列
 */
function normalizeDateTimeString(dateTimeStr) {
    if (!dateTimeStr) return '';
    
    // スラッシュをハイフンに変換
    return dateTimeStr.replace(/\//g, '-');
}

/**
 * Geminiファイル名から対応する会議のMeet IDを検索する
 * 
 * @param {string} geminiFileName - Geminiメモファイル名
 * @param {Array} fileList - Google Driveのファイル一覧（kind, id, name, mimeType, meetIdプロパティを持つオブジェクトの配列）
 * @returns {object} - 検索結果
 */
function findMeetIdFromGemini(geminiFileName, fileList) {
    const result = {
        success: false,
        meetId: null,
        matchedVideoFile: null,
        matchedVideoFileId: null,
        geminiDateTime: null,
        error: null
    };
    
    // console.log(`🔍 Searching Meet ID for Gemini file: ${geminiFileName}`);
    
    // Geminiファイルから日時を抽出
    const geminiDateTime = extractDateTimeFromGemini(geminiFileName);
    if (!geminiDateTime) {
        result.error = 'Failed to extract datetime from Gemini filename';
        // console.log(`❌ ${result.error}`);
        return result;
    }
    
    result.geminiDateTime = geminiDateTime;
    const normalizedGeminiDateTime = normalizeDateTimeString(geminiDateTime);
    // console.log(`📅 Extracted datetime from Gemini: ${geminiDateTime} → ${normalizedGeminiDateTime}`);
    
    // 動画ファイルの中から同じ日時のファイルを検索
    const videoFiles = fileList.filter(file => file.mimeType === 'video/mp4');
    // console.log(`🎥 Searching among ${videoFiles.length} video files`);
    
    for (const videoFile of videoFiles) {
        const videoDateTime = extractDateTimeFromVideo(videoFile.name);
        if (!videoDateTime) {
            // console.log(`⏭️  Skipping video file (no datetime): ${videoFile.name}`);
            continue;
        }
        
        const normalizedVideoDateTime = normalizeDateTimeString(videoDateTime);
        // console.log(`🔍 Comparing: ${normalizedGeminiDateTime} vs ${normalizedVideoDateTime}`);
        
        if (normalizedGeminiDateTime === normalizedVideoDateTime) {
            const meetId = extractMeetIdFromVideo(videoFile.name);
            if (meetId) {
                result.success = true;
                result.meetId = meetId;
                result.matchedVideoFile = videoFile.name;
                result.matchedVideoFileId = videoFile.id;
                // console.log(`✅ Found matching Meet ID: ${meetId} from video: ${videoFile.name}`);
                return result;
            } else {
                // console.log(`⚠️  Found matching datetime but no Meet ID in: ${videoFile.name}`);
            }
        }
    }
    
    result.error = 'No matching video file found for the Gemini datetime';
    // console.log(`❌ ${result.error}`);
    return result;
}

/**
 * ファイルリストからGemini-Meet IDのマッピングを作成する
 * 
 * @param {Array} fileList - Google Driveのファイル一覧（kind, id, name, mimeType, meetIdプロパティを持つオブジェクトの配列）
 * @returns {Array} - Geminiファイルと対応するMeet IDのマッピング
 */
function createGeminiMeetIdMapping(fileList) {
    // console.log(`🗺️  Creating Gemini-Meet ID mapping from ${fileList.length} files`);
    
    const mappings = [];
    
    // Geminiファイルを検索
    const geminiFiles = fileList.filter(file => {
        const trimmedName = file.name.trim();
        return file.mimeType === 'application/vnd.google-apps.document' &&
               trimmedName.includes('Gemini によるメモ') && 
               trimmedName.includes('JST に開始した会議');
    });
    
    // console.log(`🤖 Found ${geminiFiles.length} Gemini files`);
    
    geminiFiles.forEach(geminiFile => {
        const result = findMeetIdFromGemini(geminiFile.name, fileList);
        
        mappings.push({
            geminiFile: geminiFile.name,
            geminiFileId: geminiFile.id,
            geminiMimeType: geminiFile.mimeType,
            meetId: result.meetId,
            matchedVideoFile: result.matchedVideoFile,
            matchedVideoFileId: result.matchedVideoFileId,
            success: result.success,
            error: result.error,
            geminiDateTime: result.geminiDateTime
        });
    });
    
    // console.log(`📊 Created ${mappings.length} mappings`);
    // mappings.forEach(mapping => {
    //     if (mapping.success) {
    //         console.log(`✅ ${mapping.geminiFile.trim()} → ${mapping.meetId}`);
    //     } else {
    //         console.log(`❌ ${mapping.geminiFile.trim()} → ${mapping.error}`);
    //     }
    // });
    
    return mappings;
}

module.exports = {
    extractDateTimeFromGemini,
    extractDateTimeFromVideo,
    extractMeetIdFromVideo,
    findMeetIdFromGemini,
    createGeminiMeetIdMapping
};
