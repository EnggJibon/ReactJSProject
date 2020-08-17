import React from 'react';
import {
  Page,
  BlockTitle,
  List,
  ListItem,
  Label,
  Input,
  Row,
  AccordionItem,
  AccordionToggle,
  Stepper,
  Col,
  Block,
  Link,
  Toolbar
} from 'framework7-react';

import DictionaryLoader from 'karte/shared/logics/dictionary-loader';
import { APP_DIR_PATH } from 'karte/shared/logics/app-location';
import { UnexpectedError } from 'karte/shared/logics/errors';
import DocumentTitle from 'react-document-title';
import AppNavbar from 'karte/shared/components/AppNavbar';
import Choice from 'karte/shared/master/choice';
import { updateMachineReportInfo, clearMachineReport } from 'karte/apps/machine/reducers/machine-report-reducer';
import { connect } from 'react-redux';

export class MachineDefectRegistration extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dict: {
        application_title: '',
        close: '',
        mold_id: '',
        machine_report_date: '',
        component_code: '',
        production_start_user: '',
        in_production: '',
        user_department: '',
        search: '',
        mst_error_record_not_found: '',
        defect_burrs: '',
        defect_short: '',
        defect_deform: '',
        total: '',
        cancel: '',
        ok: '',
        defect_registration: '',
      },

      total: 0,
      componentId: '',
      componentCode: '',
      reportDate: '',

      editIndex: 0,
      currentComponentCodeIndex: 0,

      productionDefectsDaily: [], //分類項目マスタの生産不具合区分
      productionDetailId: '',
      productionProdDepartment: ''
    };

    this.bakProductionDefectsDaily = [];
    this.machineReportInfo = props.reportInfo;
    this.backMachineReportInfo = JSON.parse(JSON.stringify(this.machineReportInfo));//キャンセル時用
  }

  /**
   * 
   * @param {*} setDefault 
   */
  createPickerComponentCode(setDefault) {
    var me = this;
    var _values = [];
    var _displayValues = [];

    var defaultValue = this.state.componentId;
    var displayValue = this.state.componentCode;

    let machineDailyReportProdDetails = this.machineReportInfo.machineDailyReportDetails[this.state.editIndex].machineDailyReportProdDetails;
    for (var i = 0; i < machineDailyReportProdDetails.length; i++) {
      let machineDailyReportProdDetail = machineDailyReportProdDetails[i];
      _values.push(machineDailyReportProdDetail.componentId + '*' + machineDailyReportProdDetail.productionDetailId + '*' + i);
      _displayValues.push(machineDailyReportProdDetail.componentCode);
    }
    if (me.pickerComponentCode) {
      me.pickerComponentCode.destroy();
    }

    me.pickerComponentCode = me.createPicker('#machine-defect-registration-page-component-code', _values, _displayValues,
      //Col Change Callback
      (picker, value, displayValue) => {
        let values = value.split('*');
        let componentId = values[0];
        let productionDetailId = values[1];
        let currentComponentCodeIndex = parseInt(values[2]);

        if (this.state.componentId !== componentId) {

          this.setState({
            componentCode: displayValue,
            componentId: componentId,
            currentComponentCodeIndex: currentComponentCodeIndex,
            productionDetailId: productionDetailId
          });

          let machineDailyReportProdDetails = me.machineReportInfo.machineDailyReportDetails[me.state.editIndex].machineDailyReportProdDetails;
          if (!machineDailyReportProdDetails[currentComponentCodeIndex].productionDefectsDaily) {

            let newProductionDefectsDaily = JSON.parse(JSON.stringify(this.bakProductionDefectsDaily));
            for (let i = 0; i < newProductionDefectsDaily.length; i++) {
              newProductionDefectsDaily[i].productionDetailId = productionDetailId;
            }

            this.machineReportInfo.machineDailyReportDetails[this.state.editIndex]
              .machineDailyReportProdDetails[currentComponentCodeIndex]
              .productionDefectsDaily = newProductionDefectsDaily;

            this.setState({
              productionDefectsDaily: newProductionDefectsDaily
            });

            me.calcTotal(newProductionDefectsDaily);

          } else {
            let productionDefectsDaily = JSON.parse(JSON.stringify(this.bakProductionDefectsDaily));

            let peportProductionDefectsDaily = this.machineReportInfo.machineDailyReportDetails[this.state.editIndex].machineDailyReportProdDetails[currentComponentCodeIndex].productionDefectsDaily;
            for (let i = 0; i < productionDefectsDaily.length; i++) {
              for (let j = 0; j < peportProductionDefectsDaily.length; j++) {
                if (productionDefectsDaily[i].defectSeq === peportProductionDefectsDaily[j].defectSeq) {
                  productionDefectsDaily[i].quantity = peportProductionDefectsDaily[j].quantity;
                  productionDefectsDaily[i].productionDetailId = peportProductionDefectsDaily[j].productionDetailId;
                }
              }
            }
            this.machineReportInfo.machineDailyReportDetails[this.state.editIndex].machineDailyReportProdDetails[currentComponentCodeIndex].productionDefectsDaily = productionDefectsDaily;

            me.calcTotal(productionDefectsDaily);
            me.setState({
              productionDefectsDaily: productionDefectsDaily
            });
          }
        }
      }
    );
    if (setDefault && defaultValue !== null) {
      me.pickerComponentCode.setValue([defaultValue], 0);
      me.setState({
        componentId: defaultValue,
        componentCode: displayValue
      });
    }
  }

  /**
   * 
   */
  componentDidMount() {

    if (this.machineReportInfo.length === 0) {
      this.$f7router.navigate(APP_DIR_PATH + '/report', { reloadAll: true });
      return;
    }

    let me = this;
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

    if (this.machineReportInfo.length === 0) {
      this.$f7router.navigate(APP_DIR_PATH + '/report', { reloadAll: true });
      return;
    }

    let me = this;
    let editIndex = parseInt(me.$f7route.query.editIndex);
    let currentComponentCodeIndex = parseInt(me.$f7route.query.currentComponentCodeIndex);
    //選択されている部品インディクスセット
    let machineDailyReportDetail = this.machineReportInfo.machineDailyReportDetails[editIndex];
    let machineDailyReportProdDetail = machineDailyReportDetail.machineDailyReportProdDetails[currentComponentCodeIndex];

    this.setState({
      editIndex: editIndex,
      currentComponentCodeIndex: currentComponentCodeIndex,
      reportDate: this.machineReportInfo.reportDate,
      componentCode: machineDailyReportProdDetail.componentCode,
      componentId: machineDailyReportProdDetail.componentId,
      productionDetailId: machineDailyReportProdDetail.productionDetailId,
      productionProdDepartment: machineDailyReportDetail.productionProdDepartment
    });

    this.getDefectsChioce(machineDailyReportDetail.productionProdDepartment);

    me.componentCodePickerTimer = setTimeout(() => {
      me.createPickerComponentCode(true);
    }, 200);

  }

  /**
   * 分類項目マスタの生産不具合区分を表示順ですべて表示する。
   */
  getDefectsChioce(productionProdDepartment) {
    let me = this;
    let department = this.state.productionProdDepartment === '' ? productionProdDepartment : this.state.productionProdDepartment;
    Choice.categories('tbl_production_defect.defect_type', { parentSeq: department })
      .then((value) => {
        let mstChoiceVo = value.mstChoiceVo;
        let productionDefectsDaily = [];
        for (let key in mstChoiceVo) {
          let item = {
            quantity: 0,
            productionDetailId: me.state.productionDetailId,
            defectSeq: parseInt(mstChoiceVo[key].seq),
            choice: mstChoiceVo[key].choice,
          };
          let itemBak = {
            quantity: 0,
            productionDetailId: '',
            defectSeq: parseInt(mstChoiceVo[key].seq),
            choice: mstChoiceVo[key].choice,
          };
          this.bakProductionDefectsDaily.push(itemBak);
          productionDefectsDaily.push(item);

        }

        let machineDailyReportDetail = this.machineReportInfo.machineDailyReportDetails[me.state.editIndex];
        let machineDailyReportProdDetail = machineDailyReportDetail.machineDailyReportProdDetails[me.state.currentComponentCodeIndex];

        if (!machineDailyReportProdDetail.productionDefectsDaily || machineDailyReportProdDetail.productionDefectsDaily.length === 0) {
          machineDailyReportProdDetail.productionDefectsDaily = productionDefectsDaily;
        } else {

          let peportProductionDefectsDaily = machineDailyReportProdDetail.productionDefectsDaily;

          for (let i = 0; i < productionDefectsDaily.length; i++) {
            for (let j = 0; j < peportProductionDefectsDaily.length; j++) {
              if (productionDefectsDaily[i].defectSeq === peportProductionDefectsDaily[j].defectSeq) {
                productionDefectsDaily[i].quantity = peportProductionDefectsDaily[j].quantity;
              }
            }
          }
          me.calcTotal(productionDefectsDaily, me.state.editIndex);
          machineDailyReportProdDetail.productionDefectsDaily = productionDefectsDaily;
        }

        this.setState({
          productionDefectsDaily: productionDefectsDaily
        });
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
    this.backMachineReportInfo.reload = '2';
    this.props.updateMachineReportInfo(this.backMachineReportInfo);
    this.$f7router.back();
  }

  /**
   * Picker作成共通処理
   * @param {*} elementName
   * @param {*} _values
   * @param {*} _displayValues
   * @param {*} onColChange
   */
  createPicker(elementName, _values, _displayValues, onColChange) {
    var me = this;
    const app = me.$f7;
    return app.picker.create({
      inputEl: elementName,
      formatValue: function (values, displayValues) {
        return displayValues[0];
      },
      routableModals: false, //URLを変更しない
      toolbarCloseText: me.state.dict.close,
      cols: [
        {
          textAlign: 'center',
          values: _values,
          displayValues: _displayValues,
          onChange: onColChange
        }
      ],
    });
  }

  /**
   * 
   * @param {*} arr 
   */
  calcTotal(arr, editIndex) {
    let sum = 0;
    arr.forEach(function (item) {
      if (item && item.quantity) {
        sum += parseInt(item.quantity);
      }
    });

    this.setState({
      total: sum
    });

    this.machineReportInfo.machineDailyReportDetails[this.state.editIndex === 0 ? editIndex : this.state.editIndex].machineDailyReportProdDetails[this.state.currentComponentCodeIndex]['defectCount'] = sum;

  }

  /**
   * 
   * @param {*} index 
   * @param {*} value 
   */
  stepperChangeHandler(index, value) {
    let me = this;
    let machineDailyReportProdDetails = this.machineReportInfo.machineDailyReportDetails[this.state.editIndex].machineDailyReportProdDetails;
    let machineDailyReportProdDetail = machineDailyReportProdDetails[me.state.currentComponentCodeIndex];
    machineDailyReportProdDetail.productionDefectsDaily[index]['quantity'] = parseInt(value);

    let newArr = [...this.state.productionDefectsDaily];
    newArr[index].quantity = value;
    this.setState({
      productionDefectsDaily: newArr,
    });
    this.calcTotal(newArr, me.state.editIndex);
  }

  /**
   * 
   */
  buttonOk() {
    this.machineReportInfo.reload = '2';
    let shotCount = this.machineReportInfo.machineDailyReportDetails[this.state.editIndex].shotCount;
    let countPerShot = this.machineReportInfo.machineDailyReportDetails[this.state.editIndex].machineDailyReportProdDetails[this.state.currentComponentCodeIndex].countPerShot;
    let defectCount = this.machineReportInfo.machineDailyReportDetails[this.state.editIndex].machineDailyReportProdDetails[this.state.currentComponentCodeIndex].defectCount;
    this.machineReportInfo.machineDailyReportDetails[this.state.editIndex].machineDailyReportProdDetails[this.state.currentComponentCodeIndex].completeCount = shotCount * countPerShot - defectCount;
    this.props.updateMachineReportInfo(this.machineReportInfo);
    this.$f7router.back();
  }

  /**
   * 
   */
  buttonCancel() {
    this.backMachineReportInfo.reload = '2';
    this.props.updateMachineReportInfo(this.backMachineReportInfo);
    this.$f7router.back();
  }

  /**
   * 
   */
  render() {
    return (
      <DocumentTitle title={this.state.dict.defect_registration}>
        <Page
          id="machine-defect-registration-page"
          onPageInit={this.onPageInit.bind(this)}
          onPageBeforeRemove={this.onPageBeforeRemove.bind(this)}
          infinitePreloader={false}
          style={{ paddingBottom: '80px' }}
        >
          <AppNavbar applicationTitle={this.state.dict.application_title} showBack={true} backClick={this.onBackClick.bind(this)}></AppNavbar>
          <BlockTitle>{this.state.dict.defect_registration}</BlockTitle>

          <Block style={{ margin: '0' }}>
            <AccordionItem>
              <AccordionToggle>
                <Row>
                  <Col width="30">{this.state.dict.machine_report_date}</Col>
                  <Col width="50">{this.state.reportDate}</Col>
                </Row>
              </AccordionToggle>
            </AccordionItem>
          </Block>
          <List noHairlinesBetween className="no-margin-top no-margin-bottom">
            <ListItem>
              <Label >{this.state.dict.component_code}</Label>
              <Input type="text"
                name="componentCode"
                value={this.state.componentCode}
                inputId="machine-defect-registration-page-component-code"
              />
            </ListItem>
          </List>

          <List noHairlinesBetween className="no-margin-top no-margin-bottom">
            {
              this.state.productionDefectsDaily.map((item, index) => {
                return (
                  <Block className="no-margin-bottom" inner accordionList
                    key={'machine-defect-registration-page-defect' + this.state.currentComponentCodeIndex + index}>
                    <Row className="margin-top">

                      <Col width='50'>{item.choice}</Col>

                      <Stepper fill value={item.quantity ? item.quantity : 0}
                        id={'machine-defect-registration-page-defect' + this.state.currentComponentCodeIndex + index}
                        stepperChangeHandler
                        onStepperChange={this.stepperChangeHandler.bind(this, index)}>
                      </Stepper>
                    </Row>
                  </Block>
                );
              })
            }
          </List>

          <Block className="no-margin-bottom" inner accordionList>
            <Row className="margin-top">
              <Col width='80'>{this.state.dict.total}</Col>
              <Col width='20'>{this.state.total + ''}</Col>
            </Row>
          </Block>

          <Toolbar bottomMd>
            <Link
              onClick={this.buttonOk.bind(this)}>
              {this.state.dict.ok}
            </Link>
            <Link
              onClick={this.buttonCancel.bind(this)}>
              {this.state.dict.cancel}
            </Link>
          </Toolbar>
        </Page>
      </DocumentTitle >
    );
  }
}

function mapStateToProps(state) {
  return {
    reportInfo: state.machine.machineReport.reportInfo
  };
}

function mapDispatchToProps(dispatch) {
  return {

    updateMachineReportInfo(value) {
      dispatch(updateMachineReportInfo(value));
    },

    clearMachineReport(value) {
      dispatch(clearMachineReport(value));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MachineDefectRegistration);