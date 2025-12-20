# Excalidraw - Solid.js版 使用ガイド

このプロジェクトにはSolid.jsから使えるExcalidrawコンポーネントが実装されています。

## 仕組み

ExcalidrawはReactベースのライブラリですが、Solid.jsから以下の方法で使用しています：

1. Solid.jsの`onMount`でReactコンポーネントをマウント
2. React DOMの`createRoot`を使用してコンテナにレンダリング
3. Solid.jsのライフサイクルでクリーンアップ

## ファイル構成

```
src/
├── components/
│   └── ExcalidrawDemo.tsx     # Solid.js対応のExcalidrawコンポーネント
└── routes/
    └── excalidraw.tsx         # Excalidrawページ
```

## 使い方

### 1. 開発サーバーの起動

```bash
bun dev
```

### 2. ブラウザでアクセス

```
http://localhost:3000/excalidraw
```

または、ナビゲーションリンクから「Excalidraw」をクリック

## コンポーネントの使用例

### 基本的な使い方

```tsx
import ExcalidrawDemo from "~/components/ExcalidrawDemo";

export default function MyPage() {
  return <ExcalidrawDemo />;
}
```

### カスタマイズ例

`ExcalidrawDemo.tsx`を編集してカスタマイズできます：

#### 初期要素の変更

```typescript
initialData: {
  elements: [
    {
      type: "rectangle",
      id: "rect1",
      x: 50,
      y: 50,
      width: 300,
      height: 200,
      strokeColor: "#e03131",
      backgroundColor: "#ffe3e3",
      // ... その他の必須プロパティ
    }
  ],
}
```

#### 背景色の変更

```typescript
initialData: {
  appState: {
    viewBackgroundColor: "#f8f9fa",
  },
}
```

## 利用可能な機能

### ボタン機能

1. **四角形を追加** - ランダムな位置に四角形を追加
2. **クリア** - キャンバスをリセット
3. **JSONエクスポート** - コンソールにデータを出力

### プログラマティックな操作

```typescript
// 新しい要素を追加
const newElement = {
  type: "ellipse",
  id: `circle-${Date.now()}`,
  x: 100,
  y: 100,
  width: 150,
  height: 150,
  strokeColor: "#000000",
  backgroundColor: "#a3d4ff",
  fillStyle: "hachure",
  strokeWidth: 2,
  strokeStyle: "solid",
  roughness: 1,
  opacity: 100,
  angle: 0,
  seed: Math.floor(Math.random() * 100000),
  version: 1,
  versionNonce: 0,
  isDeleted: false,
  groupIds: [],
  boundElements: null,
  updated: Date.now(),
  link: null,
  locked: false,
};

excalidrawAPI.updateScene({
  elements: [...excalidrawAPI.getSceneElements(), newElement],
});
```

## 要素タイプ

Excalidrawで使用できる要素タイプ：

- `rectangle` - 四角形
- `ellipse` - 楕円/円
- `arrow` - 矢印
- `line` - 線
- `text` - テキスト
- `diamond` - ひし形
- `freedraw` - 自由描画

## 必須プロパティ

すべての要素には以下のプロパティが必要です：

```typescript
{
  type: string,           // 要素タイプ
  id: string,             // 一意のID
  x: number,              // X座標
  y: number,              // Y座標
  width: number,          // 幅
  height: number,         // 高さ
  strokeColor: string,    // 線の色
  backgroundColor: string,// 背景色
  fillStyle: string,      // 塗りつぶしスタイル
  strokeWidth: number,    // 線の太さ
  strokeStyle: string,    // 線のスタイル
  roughness: number,      // ラフさ (0-2)
  opacity: number,        // 不透明度 (0-100)
  angle: number,          // 回転角度
  seed: number,           // ランダムシード
  version: number,        // バージョン
  versionNonce: number,   // バージョンノンス
  isDeleted: boolean,     // 削除フラグ
  groupIds: string[],     // グループID
  boundElements: any,     // バウンド要素
  updated: number,        // 更新タイムスタンプ
  link: string | null,    // リンク
  locked: boolean,        // ロックフラグ
}
```

## Excalidraw API メソッド

### getSceneElements()
現在の全要素を取得

```typescript
const elements = excalidrawAPI.getSceneElements();
```

### getAppState()
アプリケーションの状態を取得

```typescript
const state = excalidrawAPI.getAppState();
```

### updateScene()
シーンを更新

```typescript
excalidrawAPI.updateScene({
  elements: [...],
  appState: { ... }
});
```

### resetScene()
シーンをリセット（全削除）

```typescript
excalidrawAPI.resetScene();
```

## トラブルシューティング

### コンポーネントが表示されない

1. Reactとreact-domがインストールされているか確認
```bash
bun install
```

2. 型定義がインストールされているか確認
```bash
bun add -d @types/react @types/react-dom
```

### TypeScriptエラーが出る

`any`型を使用しているため、一部の型チェックは緩和されています。厳密な型定義が必要な場合は、Excalidrawの型定義をインポートしてください。

### パフォーマンスの問題

大量の要素を追加する場合は、バッチ更新を検討してください：

```typescript
const newElements = [];
for (let i = 0; i < 100; i++) {
  newElements.push(createNewElement());
}

excalidrawAPI.updateScene({
  elements: [...excalidrawAPI.getSceneElements(), ...newElements],
});
```

## 参考リンク

- [Excalidraw 公式ドキュメント](https://docs.excalidraw.com/)
- [Excalidraw GitHub](https://github.com/excalidraw/excalidraw)
- [Solid.js ドキュメント](https://www.solidjs.com/docs/latest)
