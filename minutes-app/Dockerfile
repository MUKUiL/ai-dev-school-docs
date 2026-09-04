# 開発・検証はこのコンテナの中だけで行う。
# ホストには Node.js も依存パッケージも入れない。
FROM node:22-bookworm-slim

# コンテナ内での検証用に git だけ入れる（Claude Code はホスト側。コンテナには入れない）
RUN apt-get update && apt-get install -y --no-install-recommends git && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 依存の定義だけを先に入れる（変更が無ければこの層が再利用される）
COPY package.json ./
RUN npm install

# ソースは compose のボリュームで上書きされるが、
# 単体で docker build しても動くようにコピーしておく
COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]
