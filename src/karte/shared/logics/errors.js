/**
 * 予期せぬ例外クラス
 * 1. HTTPステータスが200以外のとき
 *   errorCode: HTTPステータスコード(status)
 *   errorMessage: HTTPエラーメッセージ(message)
 * 2. APIが認証、認可エラー(E101~E106)を返却した時
 *   errorCode: APIの返却するエラーコード(errorCode)
 *   errorMessage: APIの返却するエラーメッセージ(errorMessage)
 * 
 * この例外を発生させることで、エラーページが表示される。
 * 予期すべき例外(必須項目がNULLなど)は各ページでハンドルすること。
 * 
 */
export class UnexpectedError extends Error {
  constructor(error) {
    super(error.errorMessage);
    this.errorCode = error.errorCode;
  }
}

