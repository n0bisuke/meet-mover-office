
## 稼働中

- G Move
- office
- GH Actions
- YT UP

## リンク

- https://github.com/n0bisuke/meet-mover-office
- https://github.com/n0bisuke/meet-mover-hello

## GitHubに設定する環境変数

`{}`シングルクオーとで囲みましょう。

![](https://media.cleanshot.cloud/media/112969/DPkfOyLEQns8wumQSwJmvliPIJQBgd38M5j8CfM5.jpeg?Expires=1749071065&Signature=IHTM2vJyaEgWOzr1gjpkhVakWctIX~WeWnF0eMMKZdf1B0ipIYLPtHm0tgHxPTrhWZ1AsETgNQ0BSSBl8HLiRS5DdZDoXZzHyxPCSCLujaarvQeWMjf~ZIL4~bbBa1V9ohu~nxc57EPlFKVJFp5Pc3M82fJZW8EBfrbj9RAJ75PxbgHjBmAyvIpbnMC0MlDPBANJZyvw2MYoHeS-s4ZOjKvIe5LJwHgS070dK7iZy~WcXpps2BN9vHKStvTGWdlIG1EmFnVpLN1ectz~ga9VMntSgxSQtEAxElsV~XlD0eBVGkdK7fvdFlT3Wsaldk1Jg0CfttFVZ5VJVqp2FdJLIA__&Key-Pair-Id=K269JMAT9ZF4GZ)

https://qiita.com/n0bisuke/items/1a38617f08d07ef0fc93

.env
```
G_TOKEN_OFFICE={"access_token":"ya29~~~~"token_type":"Bearer","expiry_date":1749048764936}
```

↓

こんな感じ

```
`{"access_token":"ya29~~~~"token_type":"Bearer","expiry_date":1749048764936}`
```

## コマンド一覧

### 基本コマンド
```bash
npm start              # 本番実行
npm run start:dev      # 開発環境で実行
npm run start:bun      # Bunで実行
npm run deploy         # Gitコミット&プッシュ
```

### トークン管理
```bash
# Google Drive/Sheetsトークン
npm run check-token           # トークン状態確認
npm run generate-token        # 新規トークン取得
npm run refresh-token         # セキュアなトークン更新

# YouTubeトークン
npm run check-youtube-token   # YouTubeトークン状態確認
npm run generate-youtube-token # 新規YouTubeトークン取得
npm run check-playlist        # プレイリスト設定確認
```