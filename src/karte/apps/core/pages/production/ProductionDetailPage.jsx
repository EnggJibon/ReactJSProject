import React from 'react';
import {
  Page,
  BlockTitle,
  Block,
  Row,
  Col,
  Toolbar,
  Link
} from 'framework7-react';
import DictionaryLoader from 'karte/shared/logics/dictionary-loader';
import { APP_DIR_PATH } from 'karte/shared/logics/app-location';
import { UnexpectedError } from 'karte/shared/logics/errors';
import DocumentTitle from 'react-document-title';
import AppNavbar from 'karte/shared/components/AppNavbar';
import Production from 'karte/apps/core/logics/production';
import System from 'karte/shared/master/system';
import moment from 'moment';

export default class InProductionPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dict: {
        application_title: '',
        in_production: '',
        production_date: '',
        production_start_user: '',
        work_phase: '',
        mold_id: '',
        mold_name: '',
        machine_name: '',
        disposed_shot_count: '',
        direction_code: '',
        component_code: '',
        component_name: '',
        procedure_code: '',
        count_per_shot: '',
        production_end: '',
        defect_registration: '',
        start_cancel: '',
        msg_confirm_delete: '',
        cancel: '',
        ok: '',
        yes: '',
        no: '',
        lot_number: '',
      },
      production: {},
      status: '1'
    };
    this.loadDetail();
  }

  componentDidMount() {
    //var me = this;
  }

  loadDetail() {
    let me = this;
    if (this.$f7route.query.id) {
      Promise.all([Production.getProductionDetail(this.$f7route.query.id), System.load(['system.production_end_requires_machine_daily_report'])])
        .then((values) => {
          this.setState({
            production: values[0],
            status: values[1].cnfSystems[0].configValue
          });
        })
        .catch((err) => {
          var error = err;
          me.setState(() => { throw new UnexpectedError(error); });
        });
    }
  }
  /**
   * ページ初期処理
   */
  onPageInit() {
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
   * ページ終了処理
   */
  onPageBeforeRemove() {
  }

  /**
   * 戻る
   */
  onBackClick() {
    //生産登録サブメニューに戻る
    const { reload } = this.$f7route.query;
    if (reload) {
      this.$f7router.navigate(APP_DIR_PATH + '/in-production');
    } else {
      this.$f7router.back();
    }
  }

  handleChange() {

  }

  /**
   * 生産終了ボタン
   */
  buttonEndProduction() {
    let me = this;
    let app = me.$f7;
    if (me.$f7route.query.id) {
      app.views.main.router.navigate(APP_DIR_PATH + '/production-end?id=' + me.$f7route.query.id, { reloadAll: true });
    }
  }

  /**
   * 不良登録ボタン
   */
  buttonDefectRegistration() {
    let me = this;
    let app = me.$f7;
    if (me.$f7route.query.id) {
      app.views.main.router.navigate(APP_DIR_PATH + '/production-defect-registration?pageName=productionView&id=' + me.$f7route.query.id,
        {
          pushState: true
        });
    } else {
      me.onBackClick();
    }
  }

  /**
   * 開始取消ボタン
   */
  buttonCancelStart() {
    let me = this;
    let app = me.$f7;
    if (me.$f7route.query.id) {
      me.$f7.dialog.create({
        text: this.state.dict.msg_confirm_delete,
        buttons: [{
          text: this.state.dict.yes,
          onClick: function () {
            Production.delete(me.$f7route.query.id)
              .then(() => {
                //メインメニューに戻る
                app.views.main.router.navigate(APP_DIR_PATH + '/production-sub-menu', { reloadAll: true });
              })
              .catch((err) => {
                var error = err;
                if (error['errorCode'] === 'E201') {
                  me.$f7.dialog.alert(error.errorMessage);
                } else {
                  me.setState(() => { throw new UnexpectedError(error); });
                }
              });
          }
        },
        {
          text: this.state.dict.no,
          onClick: function (dialog) {
            dialog.close();
          }
        }]
      }).open();
    }
  }


  render() {
    let productionDate = this.state.production.productionDate ? moment(new Date(this.state.production.productionDate)).format('YYYY/MM/DD') : '';
    return (
      <DocumentTitle title={this.state.dict.in_production}>
        <Page id="production-detail-page" onPageInit={this.onPageInit.bind(this)} onPageBeforeRemove={this.onPageBeforeRemove.bind(this)}>
          <AppNavbar applicationTitle={this.state.dict.application_title} showBack={true} backClick={this.onBackClick.bind(this)}></AppNavbar>
          <BlockTitle>{this.state.dict.in_production}</BlockTitle>

          <Block className="no-margin">
            <Row>
              <Col width="50">{this.state.dict.production_date}</Col>
              <Col width="50">{productionDate}</Col>
            </Row>
            <Row>
              <Col width="50">{this.state.dict.production_start_user}</Col>
              <Col width="50">{this.state.production.userName}</Col>
            </Row>
            <Row>
              <Col width="50">{this.state.dict.work_phase}</Col>
              <Col width="50">{this.state.production.mstWorkPhase ? this.state.production.mstWorkPhase.workPhaseCode + ' ' + this.state.production.mstWorkPhase.workPhaseName : ''}</Col> {/** 工程番号 工程名称 */}
            </Row>
            <Row>
              <Col width="50">{this.state.dict.mold_id}</Col>
              <Col width="50">{this.state.production.moldId}</Col>
            </Row>
            <Row>
              <Col width="50">{this.state.dict.mold_name}</Col>
              <Col width="50">{this.state.production.moldName}</Col>
            </Row>
            <Row>
              <Col width="50">{this.state.dict.machine_name}</Col>
              <Col width="50">{this.state.production.machineName}</Col>
            </Row>
            <Row>
              <Col width="50">{this.state.dict.disposed_shot_count}</Col>
              <Col className="text-align-right" width="50">{this.state.production.disposedShotCount}</Col>
            </Row>
            <Row>
              <Col width="50">{this.state.dict.direction_code}</Col>
              <Col width="50">{this.state.production.directionCode}</Col>
            </Row>
          </Block>

          {/** 明細の数だけ繰り返し */}
          {this.state.production.tblProductionDetailVos ? this.state.production.tblProductionDetailVos.map((item, index) => {
            return <Block key={index} strong className="no-margin-bottom no-margin-top">
              <Row>
                <Col width="50">{this.state.dict.component_code}</Col>
                <Col width="50">{item.componentCode}</Col>
              </Row>
              <Row>
                <Col width="50">{this.state.dict.component_name}</Col>
                <Col width="50">{item.componentName}</Col>
              </Row>
              <Row>
                <Col width="50">{this.state.dict.procedure_code}</Col>
                <Col width="50">{item.procedureCode + ' ' + item.procedureName}</Col>
              </Row>
              <Row>
                <Col width="50">{this.state.dict.lot_number}</Col>
                <Col width="50">{item.tblProductionLotBalanceVos?item.tblProductionLotBalanceVos[0].lotNumber:''}</Col>
              </Row>
              <Row>
                <Col width="50">{this.state.dict.count_per_shot}</Col>
                <Col className="text-align-right" width="50">{item.countPerShot}</Col>
              </Row>
            </Block>;
          }) : null}


          <Toolbar bottomMd>
            {/** システム設定を参照の上、表示制御すること */}
            {this.state.status === '0' ? <Link onClick={this.buttonEndProduction.bind(this)}>{this.state.dict.production_end}</Link> : null}
            <Link onClick={this.buttonDefectRegistration.bind(this)}>{this.state.dict.defect_registration}</Link>
            {/** 生産終了が表示されないときは開始取消が左側に来ること */}
            <Link onClick={this.buttonCancelStart.bind(this)}>{this.state.dict.start_cancel}</Link>
          </Toolbar>
        </Page>
      </DocumentTitle >
    );
  }

}