import os
import stat
import mimetypes
import anyio
from starlette.staticfiles import StaticFiles
from starlette.responses import StreamingResponse, Response
from starlette.types import Scope


class CompressedStaticFiles(StaticFiles):
    # ETag を生成するヘルパー（キャッシュ制御用）
    def get_etag(self, stat_result: os.stat_result) -> str:
        return f'W/"{stat_result.st_mtime}-{stat_result.st_size}"'

    async def get_response(self, path: str, scope: Scope) -> Response:
        # StaticFiles と同様に、リクエストされたパスから実ファイルを探す
        full_path, stat_result = self.lookup_path(path)

        #######################################################################
        # ケース1：ブラウザが .gz の圧縮ファイルを「直接 URL で」要求した場合
        #
        # 例）/static/metaberse/Build/WebGL Build2.data.gz
        #     /static/metaberse/Build/WebGL Build2.framework.js.gz
        #     /static/metaberse/Build/WebGL Build2.wasm.gz
        #
        # → Content-Encoding: gzip を付けて、そのまま圧縮ファイルを返す
        #######################################################################
        if stat_result and stat.S_ISREG(stat_result.st_mode):
            if path.endswith(".gz"):
                # .gz を取った元の拡張子から Content-Type を推測する
                # 例）xxx.framework.js.gz → xxx.framework.js の MIME を判定
                media_type = (
                    mimetypes.guess_type(path[:-3])[0]
                    or "application/octet-stream"
                )

                async def file_iterator_gz():
                    async with await anyio.open_file(full_path, mode="rb") as f:
                        yield await f.read()

                return StreamingResponse(
                    file_iterator_gz(),
                    headers={
                        "Content-Encoding": "gzip",
                        "Content-Type": media_type,
                        "Content-Length": str(stat_result.st_size),
                        "ETag": self.get_etag(stat_result),
                    },
                )

        #######################################################################
        # 上記以外（index.html、loader.js、css、画像など）
        # → 通常の StaticFiles の挙動にフォールバックする
        #######################################################################
        return await super().get_response(path, scope)
