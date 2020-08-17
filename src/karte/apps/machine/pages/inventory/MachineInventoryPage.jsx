import React from 'react';
import DocumentTitle from 'react-document-title';
import {
  Page,
  Label,
  Block,
  BlockTitle,
  List,
  Input,
  ListItem,
  Checkbox,
  Button,
  Row,
  Col
} from 'framework7-react';
import AppNavbar from 'karte/shared/components/AppNavbar';
import DictionaryLoader from 'karte/shared/logics/dictionary-loader';
import {UnexpectedError} from 'karte/shared/logics/errors';
//import {jsonAgent, API_BASE_URL} from 'karte/shared/logics/api-agent';
import Company from 'karte/shared/master/company';
import Location from 'karte/shared/master/location';
import InstallationSite from 'karte/shared/master/installation-site';
import Choice from 'karte/shared/master/choice';
import Authentication from 'karte/shared/logics/authentication';
import { connect } from 'react-redux';
import {APP_DIR_PATH} from 'karte/shared/logics/app-location';
import {addSearchCondition, clearSearchCondition, autoSearch} from 'karte/apps/machine/reducers/machine-inventory-reducer';
import SearchConditions from 'karte/shared/logics/search-conditions';

class MachineInventoryPage extends React.Component {
  /**
   * コンストラクタ
   * @param {*} props 
   */
  constructor(props) {
    super(props);
    this.state = {
      dict: {
        application_title: '',
        sp_machine_inventory: '',
        next: '',
        msg_sp_machine_inventory_search_explanation: '',
        sp_machine_inventory_search_cond_not_done: '',
        company_name: '',
        location_name: '',
        installation_site_name: '',
        user_department: '',
        machineDepartment: '',
        owner_company_name: '',
        msg_error_not_select: '',
        close: ''
      },
      required:'',
      companyId: '',
      companyName: '',
      locationId: '',
      locationName: '',
      installationSiteId: '',
      installationSiteName: '',
      departmentId: '',
      departmentName: '',
      ownerCompanyId: '',
      ownerCompanyName: '',
      notDone: true,
      errorMessageCompany: '',
      errorMessageLocation: '',
    };
    this.createPicker = this.createPicker.bind(this);
    this.loadLocation = this.loadLocation.bind(this);
    this.loadInstallationSite = this.loadInstallationSite.bind(this);
    this.clearPickerItems = this.clearPickerItems.bind(this);
    this.createPickerCompany = this.createPickerCompany.bind(this);
    this.createPickerLocation = this.createPickerLocation.bind(this);
    this.createPickerInstallationSite = this.createPickerInstallationSite.bind(this);
    this.clearSimplePickerItems = this.clearSimplePickerItems.bind(this);
    this.createPickerOwnerCompany = this.createPickerOwnerCompany.bind(this);
    this.createPickerDepartment = this.createPickerDepartment.bind(this);
    this.handleSimpleClear = this.handleSimpleClear.bind(this);
    //this.loadDepartment = this.loadDepartment.bind(this);
    this.mstCompanies = [];
    this.mstLocations = [];
    this.mstInstallationSites = [];
    this.departments = [];
    this.pressedNext = false; //次へが押されたかどうか
    this.screenId = 'sp_machine_stocktake';
  }
  
  /**
   * コンポーネントマウント時
   */
  componentDidMount() {
    const me = this;
    var automaticSearch = me.props.autoSrch;
    if(automaticSearch === false){
      SearchConditions.getSavedSearchConditions(me.screenId).then(function(scValues){
        var savedCondList = me.addSavedConditionsToSearch(scValues);
        if(scValues.length > 0){
          me.props.autoSearch(true);  
          me.conditionNames(savedCondList);
        }
      });
    }
  }

  /**
   * ページ初期処理
   */
  onPageInit() {
    var me = this;
    DictionaryLoader.getDictionary(this.state.dict)
      .then(function(values) {
        me.setState({dict: values});
        me.preparePickers();
      })
      .catch(function(err) {
        var error = err;
        me.setState(() => { throw new UnexpectedError(error); });
      });
    var required_mark = DictionaryLoader.requiredField();
    this.setState({required: required_mark});
  }

  preparePickers() {
    var me = this;
    //会社マスタ読み込み、会社Picker作成
    Company.load()
      .then((response) => {
        me.mstCompanies = [...response.mstCompanies];
        me.createPickerCompany(true);
        me.createPickerOwnerCompany();
      })
      .catch((err) => {
        var error = err;
        me.setState(() => { throw new UnexpectedError(error); });
      });
    //ログインユーザーの所属、所属選択肢読み込み、所属Picker作成。
    Promise.all([Authentication.whoAmI(), Choice.load('mst_user.department')])
      .then((values) => {
        let responseWho = values[0];
        let responseChoice = values[1];
        me.department = responseWho.department;
        me.departments = [...responseChoice.mstChoice];
        me.createPickerDepartment(true);
      })
      .catch((err) => {
        var error = err;
        me.setState(() => { throw new UnexpectedError(error); });
      });
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
          onChange:	onColChange
        }
      ],
    });
  }

  /**
   * 会社Picker作成
   * @param {*} setDefault 
   */
  createPickerCompany(setDefault) {
    var me = this;
    if (me.pickerCompany) {
      me.pickerCompany.destroy();
    }
    var _values = [];
    var _displayValues = [];
    var defaultValue = null;
    var defaultName = null;
    for (var i = 0; i < me.mstCompanies.length; i++) {
      let company = me.mstCompanies[i];
      _values.push(company.id);
      _displayValues.push(company.companyName);
      //自社のものをデフォルトで選択する
      if (company.myCompany === 1) {
        defaultValue = company.id;
        defaultName = company.companyName;
      }
    }
    //Pickerオブジェクト作成
    me.pickerCompany = me.createPicker('#machine-inventory-page-picker-company', _values, _displayValues,
      //Col Change Callback
      (picker, value, displayValue) => {
        const oldCompanyId = me.state.companyId;
        me.setState({companyId:  value});
        me.setState({companyName: displayValue});
        if (oldCompanyId !== value) {
          //会社が変わったら傘下の所在地を読み込む
          me.loadLocation();
        }
        if (value !== '') {
          this.setState({errorMessageCompany: ''});
        }
      }
    );
    if (setDefault && defaultValue !== null) {
      me.pickerCompany.setValue([defaultValue], 0);
      me.setState({companyId:  defaultValue});
      me.setState({companyName: defaultName});
      me.loadLocation();
    }
  }

  /**
   * 所在地Picker作成
   */
  createPickerLocation() {
    var me = this;
    var _values = [];
    var _displayValues = [];
    for (var i = 0; i < me.mstLocations.length; i++) {
      let location = me.mstLocations[i];
      _values.push(location.id);
      _displayValues.push(location.locationName);
    }
    if (me.pickerLocation) {
      me.pickerLocation.destroy();
    }
    me.pickerLocation = me.createPicker('#machine-inventory-page-picker-location', _values, _displayValues, 
      //Col Change Callback
      (picker, value, displayValue) => {
        const oldLocationId = me.state.locationId;
        me.setState({locationId:  value});
        me.setState({locationName: displayValue});
        //所在地が変わったら傘下の設置場所を読み込む
        if (oldLocationId !== value) {
          me.loadInstallationSite();
        }
        if (value !== '') {
          me.setState({errorMessageLocation: ''});
        }
      }
    );
  }

  /**
   * 所有会社Picker作成
   */
  createPickerOwnerCompany() {
    var me = this;
    if (me.pickerOwnerCompany) {
      me.pickerOwnerCompany.destroy();
    }
    var _values = [];
    var _displayValues = [];
    for (var i = 0; i < me.mstCompanies.length; i++) {
      let company = me.mstCompanies[i];
      _values.push(company.id);
      _displayValues.push(company.companyName);
    }
    //Pickerオブジェクト作成
    me.pickerOwnerCompany = me.createPicker('#machine-inventory-page-picker-owner-company', _values, _displayValues,
      //Col Change Callback
      (picker, value, displayValue) => {
        me.setState({ownerCompanyId:  value});
        me.setState({ownerCompanyName: displayValue});
      }
    );
  }
  
  /**
   * 所属Picker作成
   */
  createPickerDepartment(setDefault) {
    var me = this;
    var _values = [];
    var _displayValues = [];
    var defaultValue = null;
    var defaultName = null;
    for (var i = 0; i < me.departments.length; i++) {
      let department = me.departments[i];
      _values.push(department.mstChoicePK.seq);
      _displayValues.push(department.choice);
      //ログインユーザーの所属に等しいものをデフォルトとする
      if (me.department === department.mstChoicePK.seq) {
        defaultValue = me.department;
        defaultName = department.choice;
      }
    }
    if (me.pickerDepartment) {
      me.pickerDepartment.destroy();
    }
    me.pickerDepartment = me.createPicker('#machine-inventory-page-picker-department', _values, _displayValues, 
      //Col Change Callback
      (picker, value, displayValue) => {
        me.setState({departmentId:  value});
        me.setState({departmentName: displayValue});
      }
    );
    if (setDefault && defaultValue !== null) {
      me.pickerDepartment.setValue([defaultValue], 0);
      me.setState({departmentId:  defaultValue});
      me.setState({departmentName: defaultName});
    }
  }

  /**
   * 設置場所Picker作成
   */
  createPickerInstallationSite() {
    var me = this;
    var _values = [];
    var _displayValues = [];
    for (var i = 0; i < me.mstInstallationSites.length; i++) {
      let installationSite = me.mstInstallationSites[i];
      _values.push(installationSite.id);
      _displayValues.push(installationSite.installationSiteName);
    }
    if (me.pickerInstallationSite) {
      me.pickerInstallationSite.destroy();
    }
    me.pickerInstallationSite = me.createPicker('#machine-inventory-page-picker-installation-site', _values, _displayValues, 
      //Col Change Callback
      (picker, value, displayValue) => {
        me.setState({installationSiteId:  value});
        me.setState({installationSiteName: displayValue});
      }
    );
  }

  /**
   * 所在地読み込み
   */
  loadLocation() {
    var me = this;
    me.setState({locationId: ''});
    me.setState({locationName: ''});
    var selectedCompanyId = me.state.companyId;
    var company = me.mstCompanies.find((company) => {return (company.id === selectedCompanyId);});
    if (company) {
      Location.load(company.companyCode, true)
        .then((response) => {
          me.mstLocations = [...response.mstLocations];
          me.createPickerLocation();
        })
        .catch((err) => {
          var error = err;
          me.setState(() => { throw new UnexpectedError(error); });
        });
    }
  }

  /**
   * 設置場所読み込み
   */
  loadInstallationSite() {
    var me = this;
    me.setState({installationSiteId: ''});
    me.setState({installationSiteName: ''});
    var selectedLocationId = me.state.locationId;
    var location = me.mstLocations.find((location) => {return (location.id === selectedLocationId);});
    if (location) {
      InstallationSite.load(location.locationCode, true)
        .then((response) => {
          me.mstInstallationSites = [...response.mstInstallationSites];
          me.createPickerInstallationSite();
        })
        .catch((err) => {
          var error = err;
          me.setState(() => { throw new UnexpectedError(error); });
        });
    }
  }

  /**
   * クリアボタン押下(会社、所在地、設置場所)
   * @param {*} event 
   */
  handleClear(event) {
    //Inputタグのname属性にID項目名称(companyId等)が入っている
    this.setState({[event.target.name]: ''});
    //IDに対応する名称、下位のState値、Pickerのアイテムをクリア
    this.clearPickerItems();
  }

  /**
   * Pickerアイテムのクリア
   */
  clearPickerItems() {
    if (this.state.companyId === '') {
      this.setState({companyName: ''});
      //会社が消去されたとき、所在地をクリア
      this.setState({locationId: ''});
      this.setState({locationName: ''});
      //クリアボタンで消去されると次に開いたときPickerの変更イベントが起きないので再作成する
      this.createPickerCompany(false);
    }
    if (this.state.locationId === '') {
      this.setState({locationName: ''});
      //所在地がクリアされたとき、設置場所をクリア
      this.setState({installationSiteId: ''});
      this.setState({installationSiteName: ''});
      //クリアボタンで消去されると次に開いたときPickerの変更イベントが起きないので再作成する
      this.createPickerLocation();
    }
    if (this.state.installationSiteId === '') {
      this.setState({installationSiteName: ''});
      //クリアボタンで消去されると次に開いたときPickerの変更イベントが起きないので再作成する
      this.createPickerInstallationSite();
    }
  }

  /**
   * 単純なクリアボタン押下(所属、所有会社 - 上下関係のないPicker)
   * @param {*} event 
   */
  handleSimpleClear(event) {
    //Inputタグのname属性にID項目名称(companyId等)が入っている
    this.setState({[event.target.name]: ''});
    //IDに対応する名称、下位のState値、Pickerのアイテムをクリア
    this.clearSimplePickerItems();
  }

  /**
   * Pickerアイテムのクリア(所属、所有会社 - 上下関係のないPicker)
   */
  clearSimplePickerItems() {
    if (this.state.departmentId === '') {
      this.setState({departmentName: ''});
      //クリアボタンで消去されると次に開いたときPickerの変更イベントが起きないので再作成する
      this.createPickerDepartment(false);
    }
    if (this.state.ownerCompanyId === '') {
      this.setState({ownerCompanyName: ''});
      //クリアボタンで消去されると次に開いたときPickerの変更イベントが起きないので再作成する
      this.createPickerOwnerCompany();
    }
  }

  handleCheckboxChange(event) {
    this.setState({[event.target.name]: event.target.checked});
  }

  /**
   * 次へボタン押下時
   */
  handleNextButton() {
    if (this.state.companyId === '') {
      this.setState({errorMessageCompany: this.state.dict.msg_error_not_select});
      return;
    }
    if (this.state.locationId === '') {
      this.setState({errorMessageLocation: this.state.dict.msg_error_not_select});
      return;
    }
    this.props.addSearchCondition({
      companyId: this.state.companyId,
      companyName: this.state.companyName,
      locationId: this.state.locationId,
      locationName: this.state.locationName,
      installationSiteId: this.state.installationSiteId,
      installationSiteName: this.state.installationSiteName,
      department: this.state.departmentId === '' || this.state.departmentId === undefined ? 0 : parseInt(this.state.departmentId),
      departmentName: this.state.departmentName,
      ownerCompanyId: this.state.ownerCompanyId,
      ownerCompanyName: this.state.ownerCompanyName,
      inventoryNotDoneFlg: this.state.notDone ? 1 : 0
    });

    var searchCondVals = [];
    var searchCondList = this.props.searchCond;
    for(var scSet in searchCondList){
      var id = parseInt(scSet)+1;
      searchCondVals.push(
        {'elementId': 'companyId'+id, 'elementValue': searchCondList[scSet].companyId},
        {'elementId': 'departmentId'+id, 'elementValue': searchCondList[scSet].departmentId},
        {'elementId': 'installationSiteId'+id, 'elementValue': searchCondList[scSet].installationSiteId},
        {'elementId': 'inventoryNotDoneFlg'+id, 'elementValue': searchCondList[scSet].inventoryNotDoneFlg},
        {'elementId': 'locationId'+id, 'elementValue': searchCondList[scSet].locationId},
        {'elementId': 'ownerCompanyId'+id, 'elementValue': searchCondList[scSet].ownerCompanyId}
      );
    }

    SearchConditions.replaceSearchConditions(this.screenId,searchCondVals);
    this.pressedNext = true;
    this.$f7.views.main.router.navigate(APP_DIR_PATH + '/machine-inventory-result', {pushState:false, reloadAll: true});
  }

  addSavedConditionsToSearch(searchCondValues){
    var counter = 1;
    var searchCondList = [];
    
    const hash = Object.assign({}, ...searchCondValues.map(s => ({[s.elementId]: s.elementValue})));
    
    while(hash['companyId'+counter] !== undefined){
      var searchCondSet = {};

      searchCondSet.companyId = hash['companyId'+counter];
      searchCondSet.departmentId = hash['departmentId'+counter];
      searchCondSet.installationSiteId = hash['installationSiteId'+counter];
      searchCondSet.inventoryNotDoneFlg = hash['inventoryNotDoneFlg'+counter];
      searchCondSet.locationId = hash['locationId'+counter];
      searchCondSet.ownerCompanyId = hash['ownerCompanyId'+counter];
      searchCondList.push(searchCondSet);
      counter = counter+1;
    }
    return searchCondList;
  }

  conditionNames(searchCondList){
    const me = this;
    var cnt = 0;
    me.condNames(searchCondList, cnt).then(()=>{});
  }

  condNames(searchCondList, scSet){
    const me = this;
    var addCnt = scSet+1;
    var scList = searchCondList[scSet];

    if(scSet >= searchCondList.length){
      var timeInterval = setInterval(() => {
        if(me.$f7router.allowPageChange){
          clearInterval(timeInterval);
          this.pressedNext = true;
          me.$f7.views.main.router.navigate(APP_DIR_PATH + '/machine-inventory-result', {pushState:false, reloadAll: true});
        }
      }, 100);
      return;
    } else {
      if(scList !== undefined){
        return Promise.all([
          Company.loadCompanyById(scList.companyId),
          Choice.GetChoiceTxtBySeq('mst_user.department',scList.departmentId),
          InstallationSite.loadInstallationSiteById(scList.installationSiteId),
          Location.loadLocationById(scList.locationId)
        ]).then((results) => {
          var installationSiteName;
          var departmentName;
      
          if(scList.installationSiteId === undefined || scList.installationSiteId === ''){
            installationSiteName = '';
          } else {
            installationSiteName = results[2].mstInstallationSite.installationSiteName;
          }

          if(scList.departmentId === undefined || scList.departmentId === ''){
            departmentName = '';
          } else { 
            departmentName = results[1].mstChoice.choice;
          }
          
          this.props.addSearchCondition({
            companyId: scList.companyId,
            companyName: results[0].mstCompany.companyName,
            department: scList.departmentId === '' || scList.departmentId === undefined ? 0 : parseInt(this.state.departmentId),
            departmentName: departmentName,
            installationSiteId: scList.installationSiteId,
            installationSiteName: installationSiteName,
            inventoryNotDoneFlg: scList.inventoryNotDoneFlg ? 1 : 0,
            locationId: scList.locationId,
            locationName: results[3].mstLocation.locationName,
            ownerCompanyId: scList.ownerCompanyId,
            ownerCompanyName: results[0].mstCompany.companyName
          });
          me.condNames(searchCondList, addCnt);
        });
      }
    }
  }

  /**
   * Event will be triggered right before page is going to be transitioned out of view
   */
  onPageBeforeOut() {
    //続けて検索ボタンが押されていなければ、検索条件をすべてクリアする
    if (!this.pressedNext) {
      this.props.clearSearchCondition();
      this.props.autoSearch(false);
    }
  }

  onBackClick() {
    if (this.props.searchCond && this.props.searchCond.length > 0) {
      this.pressedNext = true;
      this.$f7.views.main.router.navigate(APP_DIR_PATH + '/machine-inventory-result', {pushState:false, reloadAll: true});
    }
    else {
      this.$f7.views.main.router.navigate(APP_DIR_PATH + '/', {pushState: true});
    }
  }

  /**
   * ページ終了処理
   */
  onPageBeforeRemove() {
    const me = this;
    if (me.pickerCompany) {
      me.pickerCompany.destroy();
    }
    if (me.pickerLocation) {
      me.pickerLocation.destroy();
    }
    if (me.pickerInstalationSite) {
      me.pickerInstalationSite.destroy();
    }
    if (me.pickerDepartment) {
      me.pickerDepartment.destroy();
    }
    if (me.pickerOwnerCompany) {
      me.pickerOwnerCompany.destroy();
    }
  }

  /**
   * 画面描画
   */
  render() {
    return (
      <DocumentTitle title={this.state.dict.sp_machine_inventory}>
        <Page onPageInit={this.onPageInit.bind(this)} onPageBeforeRemove={this.onPageBeforeRemove.bind(this)} onPageBeforeOut={this.onPageBeforeOut.bind(this)}>
          <AppNavbar applicationTitle={this.state.dict.application_title} showBack={true} backClick={this.onBackClick.bind(this)}></AppNavbar>
          <BlockTitle>{this.state.dict.sp_machine_inventory}</BlockTitle>
          <Block className="no-margin-top no-margin-bottom">
            <p>{this.state.dict.msg_sp_machine_inventory_search_explanation}</p>
          </Block>
          <List className="no-margin-top no-margin-bottom">
            <ListItem>
              <Label>{this.state.dict.company_name + this.state.required}</Label>
              <Input type="text" name="companyId" clearButton readonly inputId="machine-inventory-page-picker-company"
                value={this.state.companyName} onInputClear={this.handleClear.bind(this)}  required validate
                errorMessage={this.state.errorMessageCompany} errorMessageForce={this.state.errorMessageCompany!==''}
              />
            </ListItem>
            <ListItem>
              <Label>{this.state.dict.location_name+ this.state.required}</Label>
              <Input type="text" name="locationId" clearButton readonly inputId="machine-inventory-page-picker-location" 
                disabled={this.state.companyId === ''} value={this.state.locationName} 
                onInputClear={this.handleClear.bind(this)} required validate
                errorMessage={this.state.errorMessageLocation} errorMessageForce={this.state.errorMessageLocation!==''}
              />
            </ListItem>
            <ListItem>
              <Label>{this.state.dict.installation_site_name}</Label>
              <Input type="text" name="installationSiteId" clearButton readonly inputId="machine-inventory-page-picker-installation-site" 
                disabled={this.state.locationId === ''} value={this.state.installationSiteName} 
                onInputClear={this.handleClear.bind(this)}/>
            </ListItem>
          </List>
          <List className="no-margin-top no-margin-bottom">
            <ListItem>
              <Label>{this.state.dict.machineDepartment}</Label>
              <Input type="text" name="departmentId" clearButton readonly inputId="machine-inventory-page-picker-department" 
                value={this.state.departmentName} onInputClear={this.handleSimpleClear.bind(this)}/>
            </ListItem>
            <ListItem>
              <Label>{this.state.dict.owner_company_name}</Label>
              <Input type="text" name="ownerCompanyId" clearButton readonly inputId="machine-inventory-page-picker-owner-company" 
                value={this.state.ownerCompanyName} onInputClear={this.handleSimpleClear.bind(this)}/>
            </ListItem>
          </List>
          <Block className="smallMargin">
            <Row>
              <Col>
                {/* Checkboxはfastclickを禁止しないとchangeイベントが正しく動作しない */}
                <Checkbox className="no-fastclick" value="notDone" name="notDone" checked={this.state.notDone} onChange={this.handleCheckboxChange.bind(this)}>
                </Checkbox> {this.state.dict.sp_machine_inventory_search_cond_not_done}
              </Col>
            </Row>
          </Block>
          <Block className="smallMargin">
            <Row>
              <Col>
                <Button fill text={this.state.dict.next} onClick={this.handleNextButton.bind(this)}></Button>
              </Col>
            </Row>
          </Block>
        </Page>
      </DocumentTitle>
    );
  }
}

function mapStateToProps(state) {
  return {
    searchCond: state.machine.machineInventory.searchCond,
    autoSrch: state.mold.moldInventory.autoSearch
  };
}

function mapDispatchToProps(dispatch) {
  return {
    addSearchCondition(value) {
      dispatch(addSearchCondition(value));
    },
    clearSearchCondition(value) {
      dispatch(clearSearchCondition(value));
    },
    autoSearch(value) {
      dispatch(autoSearch(value));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MachineInventoryPage);
