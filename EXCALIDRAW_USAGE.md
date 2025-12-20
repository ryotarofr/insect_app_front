# Excalidraw サンプル使用方法

このプロジェクトには、Excalidrawライブラリのサンプル実装が含まれています。

## 含まれているファイル

### 1. React コンポーネント版
**ファイル:** `src/components/ExcalidrawDemo.tsx`

React を使用した Excalidraw のフル機能サンプルコンポーネントです。

#### 機能
- 描画キャンバス
- プログラマティックに要素を追加（四角形）
- キャンバスのクリア
- JSON形式でのエクスポート
- 変更イベントのリスニング

#### 使用例
```tsx
import ExcalidrawDemo from "~/components/ExcalidrawDemo";

function MyPage() {
  return <ExcalidrawDemo />;
}
```

### 2. スタンドアロンHTML版
**ファイル:** `public/excalidraw-sample.html`

ブラウザで直接開いて使用できる完全なサンプルページです。

#### アクセス方法
開発サーバーを起動後、以下のURLにアクセス:
```
http://localhost:3000/excalidraw-sample.html
```

または、ファイルを直接ブラウザで開くこともできます。

#### 機能
- 四角形、円、矢印の追加ボタン
- キャンバスのクリア
- JSONエクスポート（ダウンロード）
- 初期描画データ（サンプル図形）

## 基本的な使い方

### 要素の追加
```typescript
const newElement = {
  type: "rectangle",
  x: 100,
  y: 100,
  width: 200,
  height: 100,
  strokeColor: "#000000",
  backgroundColor: "#ffc9c9",
  fillStyle: "hachure",
  strokeWidth: 2,
  roughness: 1,
  opacity: 100,
  roundness: { type: 3 },
};

excalidrawAPI.updateScene({
  elements: [...excalidrawAPI.getSceneElements(), newElement],
});
```

### 利用可能な要素タイプ
- `rectangle` - 四角形
- `ellipse` - 楕円/円
- `arrow` - 矢印
- `line` - 線
- `text` - テキスト
- `freedraw` - 自由描画
- `image` - 画像

### スタイルオプション
- `fillStyle`: `"hachure"`, `"cross-hatch"`, `"solid"`
- `strokeWidth`: 線の太さ（数値）
- `roughness`: ラフさ（0-2）
- `opacity`: 不透明度（0-100）

### APIメソッド
```typescript
// シーン全体の要素を取得
const elements = excalidrawAPI.getSceneElements();

// アプリケーションの状態を取得
const appState = excalidrawAPI.getAppState();

// シーンをリセット（全削除）
excalidrawAPI.resetScene();

// シーンを更新
excalidrawAPI.updateScene({
  elements: [...],
  appState: { ... }
});
```

## 開発サーバーの起動

```bash
bun dev
```

その後、以下にアクセス:
- Reactコンポーネント版: `/excalidraw` (要設定)
- HTML版: `/excalidraw-sample.html`

## カスタマイズ例

### 背景色の変更
```typescript
initialData={{
  appState: {
    viewBackgroundColor: "#f0f0f0",
  },
}}
```

### 初期要素の設定
```typescript
initialData={{
  elements: [
    {
      type: "text",
      x: 100,
      y: 100,
      text: "Hello Excalidraw!",
      fontSize: 24,
    },
  ],
}}
```

### 変更イベントのハンドリング
```typescript
onChange={(elements, appState) => {
  console.log("描画が変更されました");
  // 自動保存などの処理
}}
```

## トラブルシューティング

### TypeScript エラーが出る場合
```bash
bun add -d @types/react @types/react-dom
```

### モジュールが見つからない場合
```bash
bun install
```

## 参考リンク
- [Excalidraw 公式ドキュメント](https://docs.excalidraw.com/)
- [Excalidraw GitHub](https://github.com/excalidraw/excalidraw)
