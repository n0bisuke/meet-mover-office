# カスタムYouTubeチャンネルの設定方法

## 概要

現在のシステムでは以下のYouTubeチャンネルタイプに対応しています：

- **`school`**: 授業動画用チャンネル（既存）
- **`backup`**: バックアップ用チャンネル（既存）
- **`custom`**: カスタムチャンネル1（新規追加）
- **`custom2`**: カスタムチャンネル2（新規追加）

## 設定手順

### 1. YouTubeトークンの取得

新しいチャンネル用のOAuth2トークンを取得する必要があります。

#### 手順:
1. **YouTubeクレデンシャルの確認**
   `.env` ファイルに `YOUTUBE_DS_CREDENTIALS` が設定されていることを確認

2. **YouTubeトークンの生成**
   ```bash
   # YouTubeトークンを生成
   npm run generate-youtube-token
   ```

3. **認証フロー**
   - コマンド実行後に表示されるURLにアクセス
   - YouTubeチャンネルを持つGoogleアカウントでログイン
   - アプリケーションへのアクセスを許可
   - 表示される認証コードをコピーしてターミナルに入力

4. **トークンの取得確認**
   ```bash
   # 生成されたトークンの確認
   npm run check-youtube-token
   ```

### 2. 環境変数の設定

#### ローカル環境（.env）
```bash
# 既存のトークン
YOUTUBE_POS_TOKEN="{...}"
YOUTUBE_POS_BACKUP_TOKEN="{...}"

# 新規追加するトークン
YOUTUBE_CUSTOM_TOKEN="{...}"      # カスタムチャンネル1用
YOUTUBE_CUSTOM2_TOKEN="{...}"     # カスタムチャンネル2用
```

#### GitHub Actions環境
GitHub リポジトリの Settings > Secrets and variables > Actions で以下を追加：

- `YOUTUBE_CUSTOM_TOKEN`
- `YOUTUBE_CUSTOM2_TOKEN`

### 3. チャンネル振り分けロジックの設定

`app.js` の約94行目付近でチャンネル振り分けロジックをカスタマイズ：

```javascript
// カスタムチャンネルの判定ロジック（必要に応じて条件を変更）
// 例: 特定のMeet IDパターンやファイル名でカスタムチャンネルに振り分け
if(file.meetId && file.meetId.startsWith('custom')) {
  type = 'custom';
} else if(file.name.includes('特別')) {
  type = 'custom2';
} else if(file.meetId && file.meetId.match(/^abc-/)) {
  type = 'custom';
}
```

## 判定条件の例

### 例1: Meet IDパターンで振り分け
```javascript
if(file.meetId && file.meetId.startsWith('abc-')) {
  type = 'custom';  // abc-で始まるMeet IDはカスタムチャンネル1
} else if(file.meetId && file.meetId.startsWith('xyz-')) {
  type = 'custom2'; // xyz-で始まるMeet IDはカスタムチャンネル2
}
```

### 例2: ファイル名で振り分け
```javascript
if(file.name.includes('研修')) {
  type = 'custom';  // ファイル名に「研修」を含む場合
} else if(file.name.includes('会議')) {
  type = 'custom2'; // ファイル名に「会議」を含む場合
}
```

### 例3: 日時で振り分け
```javascript
const currentHour = new Date().getHours();
if(currentHour >= 9 && currentHour <= 17) {
  type = 'custom';  // 9-17時はカスタムチャンネル1
} else {
  type = 'custom2'; // その他の時間はカスタムチャンネル2
}
```

## テスト方法

### ローカルテスト
```bash
# 環境変数を設定してテスト実行
npm run start:dev
```

### GitHub Actionsテスト
1. `dev` ブランチにプッシュ
2. GitHub Actions の Bun ワークフローが実行される
3. ログでチャンネル振り分けを確認

## 注意事項

1. **トークンのセキュリティ**: トークンは絶対にコードにハードコードしない
2. **権限確認**: 各チャンネルでアップロード権限があることを確認
3. **プライバシー設定**: カスタムチャンネルでも適切なプライバシー設定を行う
4. **ログ確認**: 初回実行時はログでチャンネル振り分けが正しく動作することを確認

## トラブルシューティング

### エラー: "Token not found"
- 環境変数名が正しく設定されているか確認
- トークンの形式が正しいか確認

### エラー: "Upload failed"
- チャンネルのアップロード権限を確認
- トークンの有効期限を確認
- YouTube APIの制限を確認

### チャンネル振り分けが動作しない
- `app.js` の判定ロジックをデバッグ
- `console.log()` でファイル情報を出力して確認
