import React from 'react';
import {
  Page,
  BlockTitle,
  List,
  ListItem,
  Label,
  Input,
  Button,
  Block,
  Row,
  Col,
  Card,
  CardFooter,
  CardContent,
  Link
} from 'framework7-react';
import DictionaryLoader from 'karte/shared/logics/dictionary-loader';
import { APP_DIR_PATH } from 'karte/shared/logics/app-location';
import { UnexpectedError } from 'karte/shared/logics/errors';
import DocumentTitle from 'react-document-title';
import AppNavbar from 'karte/shared/components/AppNavbar';
import CalendarUtil from 'karte/shared/logics/calendar-util';
import QRCodeParser from 'karte/shared/logics/qrcode-parser';

export default class IssueRegisterPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dict: {
        application_title: '',
        //必要な文言をここに足す
      },
      menus: []
    };
  }

  componentDidMount() {
    var me = this;
    DictionaryLoader.getDictionary(this.state.dict)
      .then(function (values) {
        me.setState({ dict: values });
      })
      .catch(function (err) {
        var error = err;
        me.setState(() => { throw new UnexpectedError(error); });
      });
  }

  /**
   * ページ初期処理
   */
  onPageInit() {
    var me = this;
    const app = me.$f7;
    //作成したオブジェクトはページ終了処理で廃棄(destroy)する
    me.registerDateCalendar = app.calendar.create(
      CalendarUtil.getCalendarProperties('#issue-register-page-register-date'));
    me.measureDueDateCalendar = app.calendar.create(
      CalendarUtil.getCalendarProperties('#issue-register-page-measure-due-date'));
    me.measureCompletedDateCalendar = app.calendar.create(
      CalendarUtil.getCalendarProperties('#issue-register-page-measure-completed-date'));
  }

  /**
   * ページ終了処理
   */
  onPageBeforeRemove() {
    var me = this;
    if (me.registerDateCalendar) {
      me.registerDateCalendar.destroy();
    }
    if (me.measureDueDateCalendar) {
      me.measureDueDateCalendar.destroy();
    }
    if (me.measureCompletedDateCalendar) {
      me.measureCompletedDateCalendar.destroy();
    }
  }

  /**
   * 戻る
   */
  onBackClick() {
    //編集モードのときは不具合一覧に戻ること
    this.$f7.views.main.router.navigate(APP_DIR_PATH + '/', { pushState: true });
  }

  /**
   * 金型ID用QRボタン
   */
  buttonMoldQRClick() {
    //QRページを遷移して金型ID読み取り
    // QRCodeParser.parseMoldID メソッドを使用(非同期処理)
    var qrstring = 'String from QR page';
    QRCodeParser.parseMoldID(qrstring).then(

    );
  }

  /**
   * 部品コード用QRボタン
   */
  buttonComponentQRClick() {
    //QRページを遷移して部品コード読み取り
  }

  /**
   * 設備ID用QRボタン
   */
  buttonMachineQRClick() {
    //QRページを遷移して設備ID読み取り
    // QRCodeParser.parseMachineID メソッドを使用(非同期処理)
    var qrstring = 'String from QR page';
    QRCodeParser.parseMachineID(qrstring).then(

    );
  }

  /**
   * 金型検索ボタン
   */
  buttonMoldSearch() {

  }

  /**
   * 部品検索ボタン
   */
  buttonComponentSearch() {

  }

  /**
   * カメラフォームボタン
   */
  buttonCameraForm() {

  }

  /**
   * ファイル選択ボタン
   */
  buttonFileSelect() {

  }

  /**
   * 登録ボタン
   */
  buttonRegistration() {
    //登録ボタンを非活性化し二度押しを防止する
    //Preloaderを表示
    //APIデータ登録
    //Preloaderを消去
    //メインメニューに戻る
  }

  render() {
    return (
      <DocumentTitle title="不具合入力">
        <Page onPageInit={this.onPageInit.bind(this)} onPageBeforeRemove={this.onPageBeforeRemove.bind(this)}>
          <AppNavbar applicationTitle={this.state.dict.application_title} showBack={true} backClick={this.onBackClick.bind(this)}></AppNavbar>
          <BlockTitle>不具合入力</BlockTitle>
          <List noHairlinesBetween className="no-margin-top no-margin-bottom">
            <ListItem>
              <Label>登録日</Label> {/* 初期値システム日付 */}
              <Input type="text" name="registerDate" readonly inputId="issue-register-page-register-date" />
            </ListItem>
            <ListItem >
              <Col width="80">
                <Label >設備ID</Label>
                <Input type="text" name="machineId" clearButton inputId="issue-register-page-machine-id" />
              </Col>
              <Col width="20">
                <Button fill text="QR" onClick={this.buttonMachineQRClick.bind(this)}></Button>
              </Col>
            </ListItem>
            <ListItem>
              <Label>設備名称</Label> {/* ログインユーザーの所属に等しい設備をピッカーから選択 */}
              <Input type="text" name="machineName" clearButton readonly inputId="issue-register-page-machine-name" />
            </ListItem>
            <ListItem >
              <Col width="80">
                <Label >金型ID</Label>
                <Input type="text" name="moldId" clearButton inputId="issue-register-page-mold-id" />
              </Col>
              <Col width="20">
                <Button fill text="QR" onClick={this.buttonMoldQRClick.bind(this)}></Button>
              </Col>
            </ListItem>
            <ListItem>

              <Col width="80"><p>金型名称をここに表示</p></Col>
              <Col width="20">
                <Button fill iconF7="search" onClick={this.buttonMoldSearch.bind(this)}></Button>
              </Col>
            </ListItem>
            <ListItem>
              <Label>メンテナンス後ショット数</Label>
              <Input type="number" name="afterMainteShotCount"
                inputId="issue-register-page-after-mainte-shot-count" clearButton />
            </ListItem>
            <ListItem >
              <Col width="80">
                <Label >部品コード</Label>
                <Input type="text" name="componentCode" clearButton inputId="issue-register-page-component-code" />
              </Col>
              <Col width="20">
                <Button fill text="QR" onClick={this.buttonComponentQRClick.bind(this)}></Button>
              </Col>
            </ListItem>
            <ListItem>
              <Col width="80"><p>部品名称をここに表示</p></Col>
              <Col width="20">
                <Button fill iconF7="search" onClick={this.buttonComponentSearch.bind(this)}></Button>
              </Col>
            </ListItem>
            <ListItem>
              <Label>数量</Label>
              <Input type="number" name="issueCount" inputId="issue-register-page-issue-count" clearButton defaultValue={0} />
            </ListItem>
            <ListItem>
              <Label>発生場所</Label> {/* ログインユーザーの所属を初期セット */}
              <Input type="text" name="reportDepartment" clearButton readonly inputId="issue-register-page-report-department" />
            </ListItem>
            <ListItem>
              <Label>不具合工程</Label> {/* 発生場所が選択されたらピッカー作成 */}
              <Input type="text" name="reportPhase" clearButton readonly inputId="issue-register-page-report-phase" />
            </ListItem>
            <ListItem>
              <Label>不具合大分類</Label> {/* 不具合工程が選択されたらピッカー作成 */}
              <Input type="text" name="reportCatgory1" clearButton readonly inputId="issue-register-page-report-category1" />
            </ListItem>
            <ListItem>
              <Label>不具合中分類</Label> {/* 不具合大分類が選択されたらピッカー作成 */}
              <Input type="text" name="reportCatgory2" clearButton readonly inputId="issue-register-page-report-category2" />
            </ListItem>
            <ListItem>
              <Label>不具合小分類</Label> {/* 不具合中分類が選択されたらピッカー作成 */}
              <Input type="text" name="reportCatgory3" clearButton readonly inputId="issue-register-page-report-category3" />
            </ListItem>
            <ListItem>
              <Label>メンテナンス分類</Label>
              <Input type="text" name="mainteType" clearButton readonly inputId="issue-register-page-mainte-type" />
            </ListItem>
            <ListItem>
              <Label>事象</Label>
              <Input type="textarea" name="issue" clearButton inputId="issue-register-page-issue" />
            </ListItem>
            <ListItem>
              <Label>対策期限</Label> {/* 初期値システム日付 */}
              <Input type="text" name="measureDueDate" readonly inputId="issue-register-page-measure-due-date" />
            </ListItem>
            <ListItem>
              <Label>対策ステータス</Label> {/* 初期値：未対応 */}
              <Input type="text" name="measureStatus" clearButton readonly inputId="issue-register-page-measure-status" />
            </ListItem>
            <ListItem>
              <Label>対策完了日</Label> {/* 初期値ブランク */}
              <Input type="text" name="measureCompletedDate" readonly inputId="issue-register-page-measure-completed-date" />
            </ListItem>
            <ListItem>
              <Label>対策内容</Label>
              <Input type="textarea" name="measureSummary" clearButton inputId="issue-register-page-measure-summary" />
            </ListItem>
          </List>
          <BlockTitle>画像</BlockTitle>
          <Block>
            <Row>
              <Col width="33">
                <Button fill iconF7="camera" onClick={this.buttonCameraForm.bind(this)}></Button>
              </Col>
              <Col width="33">
                <Button fill iconF7="photos" onClick={this.buttonFileSelect.bind(this)}></Button>
              </Col>
              <Col width="33"></Col>
            </Row>
          </Block>

          {/** 写真の数だけ動的生成するので別ファンクションで生成すること */}
          <Card>
            <CardContent>
              <img src="http://192.168.1.45/test.jpg" width="100%" alt="photo_1" />
              <Block noHairlines className="no-margin no-padding">
                <Row>
                  <Col width="50">撮影日時</Col>
                  <Col width="50">2019/01/25 13:15</Col>
                </Row>
              </Block>
              <Label>コメント</Label>
              <Input type="textarea" name="photoComment_1" clearButton inputId="issue-register-page-photo-comment-1" />
            </CardContent>
            <CardFooter>
              <p></p>
              <Link >削除</Link>
            </CardFooter>
          </Card>
          <Block>
            <Row>
              <Col>
                <Button fill text="登録" onClick={this.buttonRegistration.bind(this)}></Button>
              </Col>
            </Row>
          </Block>
        </Page>
      </DocumentTitle>
    );
  }

}