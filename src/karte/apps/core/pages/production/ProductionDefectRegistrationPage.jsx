
import React from 'react';
import {
  Page,
  BlockTitle,
  List,
  ListItem,
  Label,
  Input,
  Row,
  Stepper, Col, Block, Link, Toolbar
} from 'framework7-react';
import DictionaryLoader from 'karte/shared/logics/dictionary-loader';
import { APP_DIR_PATH } from 'karte/shared/logics/app-location';
import { UnexpectedError } from 'karte/shared/logics/errors';
import DocumentTitle from 'react-document-title';
import AppNavbar from 'karte/shared/components/AppNavbar';
import { connect } from 'react-redux';
import Choice from 'karte/shared/master/choice';
import Production from 'karte/apps/core/logics/production';
import { addCondition, clearCondition } from 'karte/apps/core/reducers/production-reducer';

export class ProductionDefectRegistration extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dict: {
        application_title: '',
        close: '',
        component_code: '',
        mst_error_record_not_found: '',
        msg_record_updated: '',
        msg_confirm_save_modification: '',
        total: '',
        cancel: '',
        ok: '',
        no: '',
        update: '',
        defect_registration: '',
      },

      total: 0,
      componentId: '',
      componentCode: '',
      productionDetailId: '',
      pageName: '',//which page come from
      currentComponentCodeIndex: 0,//which page come from
      productionDefects: [],
      isUpdated: 0
    };

    this.production = props.cond;
    this.bakProduction = JSON.parse(JSON.stringify(this.production));//キャンセル時用
    this.tblProductionDetailVos = this.production.tblProductionDetailVos;
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
    for (var i = 0; i < me.tblProductionDetailVos.length; i++) {
      let productionDetail = me.tblProductionDetailVos[i];
      _values.push(productionDetail.componentId + '*' + productionDetail.id + '*' + i);
      _displayValues.push(productionDetail.componentCode);
    }

    if (me.pickerComponentCode) {
      me.pickerComponentCode.destroy();
    }
    me.pickerComponentCode = me.createPicker('#production-defect-registration-page-component-code', _values, _displayValues,
      //Col Change Callback
      (picker, value, displayValue) => {
        let values = value.split('*');

        let oldComponentId = this.state.componentId;
        let oldProductionDetailId = this.state.productionDetailId;
        let oldComponentCode = this.state.componentCode;

        let componentId = values[0];
        let productionDetailId = values[1];
        let currentComponentCodeIndex = parseInt(values[2]);
        if (me.state.productionDetailId !== productionDetailId) {
          if (this.state.pageName === 'productionEnd') {
            if (!this.tblProductionDetailVos[currentComponentCodeIndex].tblProductionDefectList) {
              Production.getProductiondefect({
                productionDetailId: productionDetailId
              }).then((value1) => {
                if (value1.productionDefects.length !== 0) {
                  let productionDefects = value1.productionDefects;
                  let productionDetailVos = this.tblProductionDetailVos[currentComponentCodeIndex];
                  Choice.categories('tbl_production_defect.defect_type', { parentSeq: this.production.department })
                    .then((value2) => {
                      let mstChoiceVo = value2.mstChoiceVo;
                      for (let i = 0; i < productionDefects.length; i++) {
                        for (let key in mstChoiceVo) {
                          if (parseInt(productionDefects[i].defectSeq) === parseInt(mstChoiceVo[key].seq)) {
                            productionDefects[i].choice = mstChoiceVo[key].choice;
                          }
                        }
                      }
                      this.tblProductionDetailVos[currentComponentCodeIndex].tblProductionDefectList = productionDefects;
                      this.setState({
                        productionDefects: productionDefects,
                        componentCode: productionDetailVos.componentCode,
                        componentId: productionDetailVos.componentId,
                        currentComponentCodeIndex: currentComponentCodeIndex,
                        productionDetailId: productionDetailVos.id
                      });
                      me.calcTotal(productionDefects);
                    });
                } else {
                  let productionDetailVos = this.tblProductionDetailVos[currentComponentCodeIndex];
                  Choice.categories('tbl_production_defect.defect_type', { parentSeq: this.production.department })
                    .then((value) => {
                      let mstChoiceVo = value.mstChoiceVo;
                      let productionDefects = [];
                      for (let key in mstChoiceVo) {
                        let item = {
                          quantity: 0,
                          defectSeq: mstChoiceVo[key].seq,
                          choice: mstChoiceVo[key].choice
                        };
                        productionDefects.push(item);
                      }

                      this.tblProductionDetailVos[currentComponentCodeIndex].tblProductionDefectList = productionDefects;
                      this.setState({
                        productionDefects: productionDefects,
                        componentCode: productionDetailVos.componentCode,
                        componentId: productionDetailVos.componentId,
                        currentComponentCodeIndex: currentComponentCodeIndex,
                        productionDetailId: productionDetailVos.id
                      });
                      me.calcTotal(productionDefects);
                    });
                }
              });
            } else {

              me.setState({
                productionDetailId: productionDetailId,
                componentId: componentId,
                componentCode: displayValue,
                currentComponentCodeIndex: currentComponentCodeIndex,
                productionDefects: me.tblProductionDetailVos[currentComponentCodeIndex].tblProductionDefectList
              });

              me.calcTotal(me.tblProductionDetailVos[currentComponentCodeIndex].tblProductionDefectList);
            }

          } else {

            if (me.state.isUpdated === 1) {
              me.$f7.dialog.create({
                title: me.state.dict.application_title,
                text: me.state.dict.msg_confirm_save_modification,
                buttons: [{
                  text: me.state.dict.ok,
                  onClick: function () {
                    me.setState({
                      productionDetailId: productionDetailId,
                      componentId: componentId,
                      componentCode: displayValue,
                      isUpdated: 0,
                      productionDefects: [],
                      total: 0,
                      currentComponentCodeIndex: currentComponentCodeIndex
                    });
                    me.getProductionDefect(productionDetailId);
                  }
                }, {
                  text: this.state.dict.no,
                  onClick: function (dialog) {
                    me.setState({
                      productionDetailId: oldProductionDetailId,
                      componentId: oldComponentId,
                      componentCode: oldComponentCode
                    });
                    dialog.close();
                  }
                }]
              }).open();

            } else {
              me.setState({
                productionDetailId: productionDetailId,
                componentId: componentId,
                componentCode: displayValue,
                productionDefects: [],
                total: 0,
                currentComponentCodeIndex: currentComponentCodeIndex
              });
              me.getProductionDefect(productionDetailId);
            }
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
   * 
   */
  onPageInit() {
    var me = this;
    const { id, pageName, currentComponentCodeIndex } = this.$f7route.query;
    if (pageName === 'productionEnd') {
      this.setState({
        currentComponentCodeIndex: parseInt(currentComponentCodeIndex)
      });
    }
    this.setState({
      pageName: pageName
    });
    if (!id) {
      this.$f7.views.main.router.navigate(APP_DIR_PATH + '/in-production', { reloadAll: true });
      return;
    }

    if (pageName === 'productionEnd') {
      if (this.production.length === 0) {
        this.$f7.views.main.router.navigate(APP_DIR_PATH + '/production-end?id=' + id, { reloadAll: true });
        return;
      }

      if (!this.tblProductionDetailVos[parseInt(currentComponentCodeIndex)].tblProductionDefectList) {
        let productionDetailId = this.tblProductionDetailVos[parseInt(currentComponentCodeIndex)].id;
        Production.getProductiondefect({
          productionDetailId: productionDetailId
        }).then((value1) => {
          if (value1.productionDefects.length !== 0) {

            let productionDefects = value1.productionDefects;
            let productionDetailVos = this.tblProductionDetailVos[this.state.currentComponentCodeIndex];
            // 一番目の明細の部品コードを初期選択する。
            this.setState({
              componentCode: productionDetailVos.componentCode,
              componentId: productionDetailVos.componentId,
              productionDetailId: productionDetailVos.id
            });
            Choice.categories('tbl_production_defect.defect_type', { parentSeq: this.production.department })
              .then((value2) => {
                let mstChoiceVo = value2.mstChoiceVo;

                let newProductionDefects = [];
                for (let key in mstChoiceVo) {
                  let item = {
                    quantity: 0,
                    defectSeq: parseInt(mstChoiceVo[key].seq),
                    choice: mstChoiceVo[key].choice,
                    productionDetailId: productionDetailVos.id
                  };
                  newProductionDefects.push(item);
                }

                for (let i = 0; i < productionDefects.length; i++) {
                  for (let key in newProductionDefects) {
                    if (parseInt(productionDefects[i].defectSeq) === parseInt(newProductionDefects[key].defectSeq)) {
                      newProductionDefects[key].quantity = productionDefects[i].quantity;
                    }
                  }
                }

                this.tblProductionDetailVos[this.state.currentComponentCodeIndex].tblProductionDefectList = newProductionDefects;
                this.setState({
                  productionDefects: newProductionDefects
                });
                me.calcTotal(newProductionDefects);
                me.createPickerComponentCode(true);
              });
          } else {
            let productionDetailVos = this.tblProductionDetailVos[this.state.currentComponentCodeIndex];
            // 一番目の明細の部品コードを初期選択する。
            this.setState({
              componentCode: productionDetailVos.componentCode,
              componentId: productionDetailVos.componentId,
              productionDetailId: productionDetailVos.id
            });
            Choice.categories('tbl_production_defect.defect_type', { parentSeq: this.production.department })
              .then((value) => {
                let mstChoiceVo = value.mstChoiceVo;
                let productionDefects = [];
                for (let key in mstChoiceVo) {
                  let item = {
                    quantity: 0,
                    defectSeq: mstChoiceVo[key].seq,
                    choice: mstChoiceVo[key].choice,
                    productionDetailId: productionDetailVos.id
                  };
                  productionDefects.push(item);
                }

                this.tblProductionDetailVos[this.state.currentComponentCodeIndex].tblProductionDefectList = productionDefects;

                this.setState({
                  productionDefects: this.tblProductionDetailVos[this.state.currentComponentCodeIndex].tblProductionDefectList
                });
                me.createPickerComponentCode(true);
              });
          }

        });
      } else {
        DictionaryLoader.getDictionary(this.state.dict)
          .then(function (values) {
            me.setState({ dict: values });
            let productionDetailVos = me.tblProductionDetailVos[parseInt(currentComponentCodeIndex)];
            // 一番目の明細の部品コードを初期選択する。
            me.setState({
              componentCode: productionDetailVos.componentCode,
              componentId: productionDetailVos.componentId,
              productionDetailId: productionDetailVos.id,
              productionDefects: productionDetailVos.tblProductionDefectList
            });
            me.calcTotal(me.tblProductionDetailVos[parseInt(currentComponentCodeIndex)].tblProductionDefectList);
            me.createPickerComponentCode(true);
          });
      }
    } else {
      Production.getProductionDetail(id)
        .then((value) => {
          me.tblProductionDetailVos = value.tblProductionDetailVos;
          // 一番目の明細の部品コードを初期選択する。
          this.setState({
            department: value.department,
            componentCode: me.tblProductionDetailVos[this.state.currentComponentCodeIndex].componentCode,
            componentId: me.tblProductionDetailVos[this.state.currentComponentCodeIndex].componentId,
            productionDetailId: me.tblProductionDetailVos[this.state.currentComponentCodeIndex].id
          });
          me.createPickerComponentCode(true);
          me.getProductionDefect();
        })
        .catch((err) => {
          var error = err;
          me.setState(() => { throw new UnexpectedError(error); });
        });
    }
  }

  /**
   * 
   */
  getProductionDefect() {
    let me = this;
    let productionDetailId = this.state.productionDetailId;
    if (productionDetailId !== '') {
      // 生産明細IDにより登録されたデータ取得
      Production.getProductiondefect({
        productionDetailId: productionDetailId
      }).then((value) => {
        let productionDefectList = value.productionDefects;
        Choice.categories('tbl_production_defect.defect_type', { parentSeq: this.state.department })
          .then((values) => {
            let mstChoiceVo = values.mstChoiceVo;

            let productionDefectItmes = [];

            let totalCount = 0;
            for (let key in mstChoiceVo) {
              let item = {
                quantity: 0,
                productionDetailId: productionDetailId,
                defectSeq: mstChoiceVo[key].seq,
                choice: mstChoiceVo[key].choice
              };
              for (let i in productionDefectList) {//登録されたデータを初期表示
                if (parseInt(mstChoiceVo[key].seq) === productionDefectList[i].defectSeq) {
                  item.quantity = productionDefectList[i].quantity;
                  totalCount = totalCount + productionDefectList[i].quantity;
                }
              }

              productionDefectItmes.push(item);
            }

            me.setState({
              productionDefects: productionDefectItmes,
              total: totalCount
            });
          });
      });
    }
  }


  /**
   * 
   */
  onPageBeforeRemove() {
  }

  /**
   * 戻る
   */
  onBackClick() {
    var me = this;
    me.buttonCancel('back');
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

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
    if (event.target.value !== '') {
      let name = event.target.name;
      name = name.charAt(0).toUpperCase() + name.slice(1);
      this.setState({ ['errorMessage' + name]: '' });
    }
  }

  /**
   * クリアボタン押下
   * @param {*} event 
   */
  handleClear(event) {
    //クリアボタンでクリアされたら関連づくIDをクリアする
    if (event.target.value === '') {
      //Inputタグのname属性にID項目名称(companyId等)が入っている
      this.setState({ [event.target.name]: event.target.value });
    }
  }

  /**
   * 
   * @param {*} arr 
   */
  calcTotal(arr) {
    let sum = 0;
    arr.forEach(function (item) {
      if (item && item.quantity) {
        sum += parseInt(item.quantity);
      }
    });

    this.setState({
      total: sum,
    });

    if (this.state.pageName === 'productionEnd') {
      this.tblProductionDetailVos[this.state.currentComponentCodeIndex].defectCount = sum;
    }

  }

  /**
   * 
   * @param {*} index 
   * @param {*} value 
   */
  stepperChangeHandler(index, value) {

    if (this.state.pageName === 'productionEnd') {
      this.tblProductionDetailVos[this.state.currentComponentCodeIndex].tblProductionDefectList[index].quantity = parseInt(value);
      this.calcTotal(
        this.tblProductionDetailVos[this.state.currentComponentCodeIndex].tblProductionDefectList);
    } else {
      let newArr = [...this.state.productionDefects];
      newArr[index].quantity = value;
      this.setState({
        isUpdated: 1,
        productionDefects: newArr,
      });
      this.calcTotal(newArr);
    }

  }

  /**
   * 
   */
  buttonOkOrUpdate() {
    let me = this;
    if (me.state.pageName === 'productionEnd') {
      // 生産終了画面の不良数内訳ボタンから遷移したときはボタン名を「OK」とする。
      // OKボタン押下により生産不具合レコードと日別生産不具合レコードをメモリに保持し、生産終了画面に戻る。
      // 生産不具合テーブルおよび日別生産不具合テーブルへの保存は生産終了画面で登録されたときに行う。     
      me.buttonCancel('ok');
    } else if (me.state.pageName === 'productionView') {
      // 生産中の生産実績プレビュー画面より遷移したときはボタン名を「更新」とする。
      // 更新ボタン押下により生産不具合テーブルと日別生産不具合テーブルへデータを保存する。
      // 「データが更新されました」のメッセージを表示し、生産実績プレビュー画面へ戻る。
      me.$f7.preloader.show();
      Production.postProductiondefect({
        productionDefects: this.state.productionDefects
      })
        .then((R) => {
          me.$f7.preloader.hide();
          if (!R.error) {
            this.$f7.dialog.alert(this.state.dict.msg_record_updated, function () {
              me.buttonCancel('update');
            });
          }
        })
        .catch((err) => {
          me.$f7.preloader.hide();
          var error = err;
          me.setState(() => { throw new UnexpectedError(error); });
        });
    }
  }

  /**
   * 
   */
  buttonCancel(buttonName) {
    try {
      const { pageName, id } = this.$f7route.query;
      if (pageName === 'productionEnd') {
        if (buttonName === 'ok') {
          this.props.addCondition({ ...this.production, option: true });
        } else {
          this.props.addCondition({ ...this.bakProduction, option: true });
        }
        this.$f7router.back();
      } else if (pageName === 'productionView') {
        this.$f7router.navigate(APP_DIR_PATH + '/production-detail?reload=1&id=' + id, { pushState: true,reloadAll:true });
      } else {
        this.$f7router.navigate(APP_DIR_PATH + '/in-production');
      }
    } catch (error) {
      this.$f7router.navigate(APP_DIR_PATH + '/in-production');
    }
  }

  render() {
    return (
      <DocumentTitle title={this.state.dict.defect_registration}>
        <Page
          id="production-defect-registration-page"
          onPageInit={this.onPageInit.bind(this)}
          onPageBeforeRemove={this.onPageBeforeRemove.bind(this)}
          infinitePreloader={false}
          style={{ paddingBottom: '80px' }}
        >
          <AppNavbar applicationTitle={this.state.dict.application_title} showBack={true} backClick={this.onBackClick.bind(this)}></AppNavbar>
          <BlockTitle>{this.state.dict.defect_registration}</BlockTitle>
          <List noHairlinesBetween className="no-margin-top no-margin-bottom">
            <ListItem>
              <Label >{this.state.dict.component_code}</Label>
              <Input type="text"
                name="componentCode"
                value={this.state.componentCode}
                onInputClear={this.handleClear.bind(this)}
                inputId="production-defect-registration-page-component-code"
                onChange={this.handleChange.bind(this)}
              />
            </ListItem>
          </List>

          <List noHairlinesBetween className="no-margin-top no-margin-bottom">
            {
              this.state.productionDefects.map((item, index) => {
                return (
                  <Block className="no-margin-bottom" inner accordionList
                    key={'production-defect-registration-page-defect' + this.state.currentComponentCodeIndex + index}>
                    <Row className="margin-top">
                      <Col width='50'>{item.choice}</Col>
                      <Stepper fill value={item.quantity ? item.quantity : 0}
                        id={'production-defect-registration-page-defect' + this.state.currentComponentCodeIndex + index}
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
              onClick={this.buttonOkOrUpdate.bind(this)}>
              {this.state.pageName === 'productionEnd' ? this.state.dict.ok : this.state.dict.update}
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
    cond: state.core.production.cond,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    addCondition(value) {
      dispatch(addCondition(value));
    },
    clearCondition(value) {
      dispatch(clearCondition(value));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProductionDefectRegistration);