import React from 'react';
import {
  Page,
  Block,
  BlockTitle,
  List,
  ListGroup,
  ListItem,
  ListItemRow,
  ListItemCell,
  Row,
  Col,
  AccordionContent,
  Label,
  Card,
  CardContent,
  CardFooter,
  Link,
  Input,
  Button
} from 'framework7-react';
import DictionaryLoader from 'karte/shared/logics/dictionary-loader';
import { APP_DIR_PATH } from 'karte/shared/logics/app-location';
import { API_BASE_URL } from 'karte/shared/logics/api-agent';
import { UnexpectedError } from 'karte/shared/logics/errors';
import DocumentTitle from 'react-document-title';
import AppNavbar from 'karte/shared/components/AppNavbar';
import QRCodeParser from 'karte/shared/logics/qrcode-parser';
import MoldMaster from 'karte/shared/master/mold';
import CnfApplication from 'karte/shared/master/cnf-application';
import Company from 'karte/shared/master/company';
import Location from 'karte/shared/master/location';
import InstllationSite from 'karte/shared/master/installation-site';
import Mold from 'karte/apps/mold/logics/mold';
import Choice from 'karte/shared/master/choice';
import Modal, { modalStyle } from 'karte/shared/components/modal-helper';
import FileUtil from 'karte/shared/logics/fileutil';
import moment from 'moment';
export default class MoldInfoPage extends React.Component{
  constructor(props){
    super(props);
    this.state={
      dict: {
        application_title: '',
        sp_mold_reference: '',
        mold_part:'',
        main_asset_no: '',
        mold_created_date: '',
        inspected_date: '',
        installed_date: '',
        company_name: '',
        location_name: '',
        installation_site_name: '',
        status_changed_date: '',
        mold_status: '',
        component: '',
        base_info: '',
        spec: '',
        change: '',
        camera: '',
        delete_record: '',
        proc_cond: '',
        location_history: '',
        return: '',
        mold_id: '',
        mold_mainte_status: '',
        mold_name: '',
        owner_company_name: '',
        component_code: '',
        component_name: '',
        mst_error_record_not_found: '',
        close: '',
        mold_image: '',
        count_per_shot: '',
        maintenance_history:'',
        production_history: '',
        issue_report_attached_file: '',
        search: '',
        user_department: '',
        mold_last_production_date: '',
        cancel: '',
        ok: '',
        no: '',
        yes: '',
        mold_after_mainte_total_production_time_hour:'',
        mold_after_mainte_total_shot_count:'',
        mold_mainte_cycle_code_01:'',
        mold_mainte_cycle_code_02:'',
        mold_mainte_cycle_code_03:'',
        mold_total_production_time_hour:'',
        mold_total_shot_count:'',
        mold_last_mainte_date:'',
        msg_record_added:'',
        msg_error_image_limit_reached: '',
        msg_confirm_delete:'',
        msg_error_not_null: ''
      }, 
      activateArrow:true,
      errorMessageMoldId:'',
      islocationChangePermitted: '',
      accordionBasicOpened: false,
      moldId: '',
      moldUuid:'',
      moldName: '',
      componentCode: '',
      componentId: '',
      componentName: '',
      countPerShot: '',
      mainAssetNo: '',
      moldCreatedDate: '',
      inspectedDate: '',
      installedDate: '',
      companyId: '',
      companyName: '',
      locationId: '',
      locationName: '',
      instllationSiteId: '',
      instllationSiteCode:'',
      instllationSiteName: '',
      statusChangedDate:'',
      ownerCompanyId:'',
      ownerCompanyName: '',
      mainteStatus:'',
      mainteStatusText:'',
      departmentId:'',
      departmentName:'',
      lastProductionDate:'',
      totalProducingTimeHour:'',
      totalShotCount:'',
      lastMainteDate:'',
      afterMainteTotalProducingTimeHour:'',
      afterMainteTotalShotCount:'',
      mainteCycleCode01:'',
      mainteCycleCode02:'',
      mainteCycleCode03:'',    
      reportFilePath01: '',
      reportFilePath02: '',
      reportFilePath03: '',
      reportFilePath04: '',
      reportFilePath05: '',
      reportFilePath06: '',
      reportFilePath07: '',
      reportFilePath08: '',
      reportFilePath09: '',
      reportFilePath10: '',
      reportFilePathName01: '',
      reportFilePathName02: '',
      reportFilePathName03: '',
      reportFilePathName04: '',
      reportFilePathName05: '',
      reportFilePathName06: '',
      reportFilePathName07: '',
      reportFilePathName08: '',
      reportFilePathName09: '',
      reportFilePathName10: '',
      status: '',
      statusText:'',
      IsModalOpen:false,
      imageInfo:[], 
      moldDetails:[],
      statusList :[],
      componentDetails:[],
      beforeSpliceComponent:[],
      clearLocationData: {
        clearedCompanyId: '',
        clearedCompanyName: '',
        clearedLocationId: '',
        clearedLocationName: '',
        clearedInstllationSiteId: '',
        clearedInstllationSiteName: '',
      }
    };
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.machineReportInfo = props.reportInfo;
    this.mstCompanies = [];
    this.mstLocations = [];
    this.FullComponentList=[];
    this.image = document.createElement('img');
    this.mstInstllationSites = [];
    this.reportFileCollection = [];
    this.sampleClearLocationData = [];
    this.newImageInfo = [];
    this.imageUuidList =[];
    this.imageUrlList =[];
    this.fileNameUuidList = [];
    this.cnfApplicationKey='can_change_mold_location_from_tablet';
    this.isFileLoaded= false;
    this.showArrow = false;
    this.defaultInstllationSite = false;
    this.isQrScanned = false;
  }

  onPageInit() {
    var me = this;
    DictionaryLoader.getDictionary(this.state.dict)
      .then(function (values) {
        me.setState({ dict: values });
        me.createMoldIdAutocomplete();
        
      })
      .catch(function (err) {
        var error = err;
        me.setState(() => { throw new UnexpectedError(error); });
      });
  }

  onPageBeforeRemove() {
    var me = this;
    if (me.pickerCompany) {
      me.pickerCompany.destroy();
    }
    if (me.pickerLocation) {
      me.pickerLocation.destroy();
    }
    if (me.pickerInstalationSite) {
      me.pickerInstalationSite.destroy();
    }
  }
  
  // Click back button to return Main Menu
  onBackClick() {
    this.$f7router.back();
  }

  // Input clear event. 
  handleClear(event) {
    this.setState({ [event.target.name]: ''});
    if (event.target.name === 'moldId' || event.target.name === 'moldName') {
      this.clearModalDataForNewMold();
      this.clearAllInputData();  
    }
  }
  // Input clear method.
  clearAllInputData(){
    var moldDetailsData = this.state.moldDetails;
    this.setState({ moldId: '' });
    this.setState({ moldUuid: '' });
    this.setState({ moldName: '' });
    this.setState({ imageInfo: [] });
    moldDetailsData.moldId = '';
    moldDetailsData.moldUuid = '';
    moldDetailsData.moldName = '';
    this.setState({moldDetails:moldDetailsData});
    this.setState({componentDetails:[]});
    this.setState({beforeSpliceComponent:[]});
    this.setState({statusList:[]});
    this.isFileLoaded=false;
    this.showArrow=false;
    this.isQrScanned=false;
    this.defaultInstllationSite=false;
    this.newImageInfo = [];
    this.imageUuidList =[];
    this.imageUrlList =[];
  }

  // Clear Location Change Modal Form Data
  handleClearModalForm(event) {
    this.setState({[event.target.name]: ''});
    this.setState({clearLocationData:this.sampleClearLocationData});
    this.clearPickerItems();
  }

  // Clear picker Item for Modal Form clear button
  clearPickerItems() {
    if (this.state.companyId === '') {
      this.setState({companyName: ''});
      this.setState({locationId: ''});
      this.setState({locationName: ''});
      this.setState({instllationSiteId: ''});
      this.setState({instllationSiteName: ''});
      this.createPickerCompany();
    }
    if (this.state.locationId === '') {
      this.setState({locationName: ''});
      this.setState({instllationSiteId: ''});
      this.setState({instllationSiteName: ''});
      this.createPickerLocation();
    }
    if (this.state.instllationSiteId === '') {
      this.setState({instllationSiteName: ''});
      this.createPickerInstllationSite();
    }
  }

  // Clear Modal Form Data When Search by New Mold 
  clearModalDataForNewMold(){
    var me = this;
    me.sampleClearLocationData.clearedCompanyId= '';
    me.sampleClearLocationData.clearedCompanyName= '';
    me.sampleClearLocationData.clearedLocationName= '';
    me.sampleClearLocationData.clearedLocationId= '';
    me.sampleClearLocationData.clearedInstllationSiteId= '';
    me.sampleClearLocationData.clearedInstllationSiteName= '';
    this.setState({ clearLocationData: me.sampleClearLocationData });
  }

  // Keep Modal Form Data in temporary state untill Location data registered.
  getModalFormDataFromState(){
    var me = this;
    me.sampleClearLocationData = this.state.clearLocationData;
    me.sampleClearLocationData.clearedCompanyId= this.state.companyId;
    me.sampleClearLocationData.clearedCompanyName= this.state.companyName;
    me.sampleClearLocationData.clearedLocationName= this.state.locationName;
    me.sampleClearLocationData.clearedLocationId= this.state.locationId;
    me.sampleClearLocationData.clearedInstllationSiteId= this.state.instllationSiteId;
    me.sampleClearLocationData.clearedInstllationSiteName= this.state.instllationSiteName;
  }
  
  // Open QR page when mold qr button clicked
  buttonMoldQRClick() {
    this.$f7router.navigate(APP_DIR_PATH + '/qrpage', {props: { onQrRead: this.onMoldQrRead.bind(this) } });
  }

  // Load data by qrcode found form qrpage
  onMoldQrRead(code) {
    if (code) {
      this.clearAllInputData();
      QRCodeParser.parseMoldID(code).then((response) => {
        if (!response.error && response.mstMoldAutoComplete[0]) {
          this.setState({
            moldUuid: response.mstMoldAutoComplete[0].uuid,
            moldId: response.mstMoldAutoComplete[0].moldId,
            moldName: response.mstMoldAutoComplete[0].moldName,
          });
          this.loadMoldDetailsByMoldId(response.mstMoldAutoComplete[0].moldId);
          this.getLocationChangePermission();
          this.getAttachedFile();
        } else {
          this.$f7.dialog.alert(this.state.dict.mst_error_record_not_found +'<br/>'+code);
        }
      }).catch((err) => {
        var error = err;
        this.setState(() => { throw new UnexpectedError(error); });
      });
    } else {
      this.$f7.dialog.alert(this.state.dict.mst_error_record_not_found +'<br/>'+code);
    }
  }

  // Generate Mold Autocompleted List
  createMoldIdAutocomplete() {
    var me = this;
    const app = me.$f7;
    return app.autocomplete.create({
      inputEl: '#mold-info-page-mold-id',
      openIn: 'dropdown',
      valueProperty: 'moldId',  
      textProperty: 'moldId',  
      source: function (query, render) {
        var autocomplete = this;
        var results = [];
        if (query.length === 0) {
          render(results);
          return;
        }
        // Show Preloader
        autocomplete.preloaderShow();
        MoldMaster.getMoldLike({
          moldId: query
        })
          .then((response) => {
            let data = response.mstMoldAutoComplete;
            for (var i = 0; i < data.length; i++) {
              results.push(data[i]);
            }
            autocomplete.preloaderHide();
            render(results);
          })
          .catch((err) => {
            var error = err;
            if (error['errorCode'] === 'E201') {
              me.$f7.dialog.alert(error.errorMessage);
            } else {
              me.setState(() => { throw new UnexpectedError(error); });
            }
          });
      },
      on: {
        change: function (value) {
          me.clearAllInputData();
          me.setState({
            moldId: value[0].moldId,
            moldUuid: value[0].uuid,
            moldName: value[0].moldName,
          });
          me.loadMoldDetailsByMoldId(value[0].moldId);
          me.getLocationChangePermission();
          me.getAttachedFile();
        },
        closed: function (autocomplete) {
          if (me.state.moldName === '') {
            if (autocomplete.inputEl.value !== '') {
              me.$f7.dialog.alert(me.state.dict.mst_error_record_not_found);
            }
            me.setState({
              moldId: '',
              moldName: ''
            });
          }
        }
      },
    });

  }

  // Open QR page when Modal Form installation Site qr button clicked
  buttonInstllationSiteQRClick(){
    // this.onInstallationSiteQrRead('ZZInstallation');
    this.$f7router.navigate(APP_DIR_PATH + '/qrpage', {props: { onQrRead: this.onInstallationSiteQrRead.bind(this) } });
  }
  
  // Load Data for installationSite, location and company using installation site qr code
  onInstallationSiteQrRead(instllationSiteId){
    if (instllationSiteId){
      QRCodeParser.parseInstllationSiteId(instllationSiteId) 
        .then((response) => {
          if (!response.error) {
            if (response['mstInstallationSites'].length > 0){
              this.setState({
                instllationSiteId: response['mstInstallationSites'][0].id ? response['mstInstallationSites'][0].id : '',
                instllationSiteCode: response['mstInstallationSites'][0].installationSiteCode ? response['mstInstallationSites'][0].installationSiteCode : '',
                instllationSiteName: response['mstInstallationSites'][0].installationSiteName?  response['mstInstallationSites'][0].installationSiteName : '',
                locationId: response['mstInstallationSites'][0].locationId ? response['mstInstallationSites'][0].locationId : '',  
                locationCode: response['mstInstallationSites'][0]['mstLocation'].locationCode ? response['mstInstallationSites'][0]['mstLocation'].locationCode :'',
                locationName: response['mstInstallationSites'][0]['mstLocation'].locationName ? response['mstInstallationSites'][0]['mstLocation'].locationName : '', 
                companyId: response['mstInstallationSites'][0]['mstLocation'].companyId ? response['mstInstallationSites'][0]['mstLocation'].companyId :'',
                companyName: response['mstInstallationSites'][0]['mstLocation']['mstCompany'].companyName ? response['mstInstallationSites'][0]['mstLocation']['mstCompany'].companyName : '',        
              });
              this.getQrScannedInstllationList(response['mstInstallationSites'][0].locationId);
              this.getLocationListByCompanyId(response['mstInstallationSites'][0]['mstLocation'].companyId);
            }else{
              this.$f7.dialog.alert(this.state.dict.mst_error_record_not_found +'<br/>'+instllationSiteId);
            }
          } else {
            this.$f7.dialog.alert(this.state.dict.mst_error_record_not_found +'<br/>'+instllationSiteId);
          }
        }).catch((err) => {
          var error = err;
          this.setState(() => { throw new UnexpectedError(error); });
        });
    } else {
      this.$f7.dialog.alert(this.state.dict.mst_error_record_not_found +'<br/>'+instllationSiteId);
    }
  }

  // Load related installation site data List depend on Location id 
  getQrScannedInstllationList(locationId){
    if (locationId){
      InstllationSite.loadInstllationSiteByLocation(locationId) 
        .then((response) => {
          if (!response.error) { 
            this.mstInstllationSites= response['mstCLIAutoCompleteInstallationSite'];    
            this.createPickerInstllationSite();
          } else {
            this.$f7.dialog.alert(this.state.dict.mst_error_record_not_found);
          }
        }).catch((err) => {
          var error = err;
          this.setState(() => { throw new UnexpectedError(error); });
        });
    } else {
      this.$f7.dialog.alert(this.state.dict.mst_error_record_not_found);
    }
  }

  // Load related Location data List depend on company id 
  getLocationListByCompanyId(companyId){
    if (companyId){
      Location.loadLocationByCompanyId(companyId) 
        .then((response) => {
          if (!response.error) { 
            this.mstLocations= response['mstCLIAutoCompleteLocation'];    
            this.createPickerLocation();
            this.createPickerCompany();
          } else {
            this.$f7.dialog.alert(this.state.dict.mst_error_record_not_found);
          }
        }).catch((err) => {
          var error = err;
          this.setState(() => { throw new UnexpectedError(error); });
        });
    } else {
      this.$f7.dialog.alert(this.state.dict.mst_error_record_not_found);
    }

  }

  // Handle DownArrow and Up Arrow For Multiple Parts
  handleArrow(){
    //activeArrow = true will display Down Arrow, activeArrow= false will display Up Arrow   
    const currentState= this.state.activateArrow;
    if(this.state.activateArrow){
      var allComponent =this.state.componentDetails; 
      var oldComponentList = [];
      allComponent.forEach(function(item){
        oldComponentList.push(item);
      });
      this.setState({beforeSpliceComponent: oldComponentList});
    }
    this.setState({activateArrow: !currentState});
    if(this.state.activateArrow){
      var newItem = this.state.beforeSpliceComponent;
      this.setState({componentDetails:newItem},() => { 
        this.renderParts();    
      });
    }
  }

  // Display Compose/Location Change button for m-cloud user
  getLocationChangePermission(){
    var me = this;
    var displayLocationChangeBtn = false;
    CnfApplication.load({
      configKey: me.cnfApplicationKey
    })
      .then((response) => {
        if(response.configValue === '1' ){
          displayLocationChangeBtn= !displayLocationChangeBtn;
          this.setState({islocationChangePermitted:displayLocationChangeBtn});
        }
      })
      .catch(() => {
      });
  }

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
    if (event.target.value !== '') {
      let name = event.target.name;
      name = name.charAt(0).toUpperCase() + name.slice(1);
      this.setState({ ['errorMessage' + name]: '' });
    }
    this.setState({
      moldName: '',
      moldUuid: '',
    });
  }

  // Select specific mold cell from moldList/moldPopup 
  onMoldSelectedCell(item) {
    this.clearAllInputData();
    this.setState({
      moldUuid: item.moldUuid,
      moldId: item.moldId,
      moldName: item.moldName,
    });
    this.loadMoldDetailsByMoldId(item.moldId);
    this.getLocationChangePermission();
    this.getAttachedFile();
  }

  // Open Form to search Mold
  buttonMoldSearch() {
    this.$f7router.navigate(APP_DIR_PATH + '/moldsearch', {props: { onSelectedCell: this.onMoldSelectedCell.bind(this) } });
  }

  // Load Mold Status  
  loadMoldStatus(){
    var me = this;
    Choice.load('mst_mold.status')
      .then((response) => {
        me.setState({
          statusList:response['mstChoice']
        },() => {
          me.getStatusText();
        });
      })
      .catch((err) => {
        var error = err;
        me.setState(() => { throw new UnexpectedError(error); });
      });
  }
  getStatusText(){
    var me = this;
    var listOftatus = me.state.statusList;
    for(var item of listOftatus){
      if(item.mstChoicePK.seq === me.state.status.toString()){
        me.setState({ statusText : item.choice});
        break;
      }
    }
  }

  // Get Mold Details Information by searched moldid
  loadMoldDetailsByMoldId(moldId){
    var me = this;
    me.isFileLoaded = false;
    me.$f7.preloader.show();
    MoldMaster.getMoldDetail({
      moldId:moldId
    }).then((response) =>{
      me.$f7.preloader.hide();
      me.setState({ ...response });
      me.setState({
        componentDetails: response.mstMoldComponentRelationVo,
      });
      me.setState({
        moldDetails:response,
      },()=>{
        me.getImageByMoldId();
      });
      me.loadMoldStatus();
    }).catch((err) => {
      var error = err;
      me.setState(() => { throw new UnexpectedError(error); });
    });
  }

  // Compose button to Open Modal Form to change Mold Location
  buttonChangeMoldLocation(){
    var me = this;
    me.preparePickers();
    me.createPicker = me.createPicker.bind(this);
    me.loadLocation = me.loadLocation.bind(this);
    me.loadInstllationSite = me.loadInstllationSite.bind(this);
    me.createPickerCompany = me.createPickerCompany.bind(this);
    me.createPickerLocation = me.createPickerLocation.bind(this);
    me.createPickerInstllationSite = me.createPickerInstllationSite.bind(this);
    me.openModal();
  }

  // Open Location Change Modal Form and keep data in temporary state
  openModal() {
    this.setState({ IsModalOpen: true });
    this.getModalFormDataFromState();//keep original location data in temporary state.
  }
 
  // Register/Update Location Change into Database.
  registerChangedLocation(){
    var me = this;
    var moldId= this.state.moldId;
    let data = {
      moldId:me.state.moldId ? me.state.moldId: '',
      moldName: me.state.moldName ? me.state.moldName: '',
      moldUuid: me.state.moldUuid ? me.state.moldUuid: '',
      companyId:me.state.companyId ? me.state.companyId: '',
      companyName:me.state.companyId ? me.state.companyName: '',
      locationId:me.state.companyId ? me.state.locationId: '',
      locationName:me.state.companyId ? me.state.locationName: '',
      instllationSiteId: me.state.instllationSiteId ? me.state.instllationSiteId: '',
      instllationSiteName: me.state.instllationSiteName ? me.state.instllationSiteName: '',
      installedDate: moment(new Date()).format('YYYY-MM-DDTHH:mm:ss') 
    };
    me.$f7.preloader.show();
    Mold.updateMoldLocationHistory(data)
      .then(() => {
        me.$f7.preloader.hide();
        me.$f7.dialog.create({
          text: this.state.dict.msg_record_added,
          buttons: [{
            text: this.state.dict.ok,
            onClick: function () {
              me.isQrScanned = true;
              me.closeModal();
              me.loadMoldDetailsByMoldId(moldId);
            }
          }]
        }).open();
      })
      .catch((err) => {
        me.isQrScanned = false;
        me.$f7.preloader.hide();
        var error = err;
        if (error['errorCode'] === 'E201') {
          me.$f7.dialog.alert(error.errorMessage);
        } else {
          me.setState(() => { throw new UnexpectedError(error); });
        }
      });

  }
  updateImageDetails(){
    var me = this;
    let imageDetails={
      moldId:me.state.moldId ? me.state.moldId: '',
      moldUuid: me.state.moldUuid ? me.state.moldUuid: '',
      imgFilePath01:me.state.imageInfo[0]? me.state.imageInfo[0]['imageUuid']:'',
      imgFilePath02:me.state.imageInfo[1]? me.state.imageInfo[1]['imageUuid']:'',
      imgFilePath03:me.state.imageInfo[2]? me.state.imageInfo[2]['imageUuid']:'',
      imgFilePath04:me.state.imageInfo[3]? me.state.imageInfo[3]['imageUuid']:'',
      imgFilePath05:me.state.imageInfo[4]? me.state.imageInfo[4]['imageUuid']:'',
      imgFilePath06:me.state.imageInfo[5]? me.state.imageInfo[5]['imageUuid']:'',
      imgFilePath07:me.state.imageInfo[6]? me.state.imageInfo[6]['imageUuid']:'',
      imgFilePath08:me.state.imageInfo[7]? me.state.imageInfo[7]['imageUuid']:'',
      imgFilePath09:me.state.imageInfo[8]? me.state.imageInfo[8]['imageUuid']:'',
      imgFilePath10:me.state.imageInfo[9]? me.state.imageInfo[9]['imageUuid']:''
    };
    Mold.updateMstMold(imageDetails)
      .then(response => {
        if(!response.error){
          me.renderImage();
        }
      })
      .catch(err => {
        var error = err; 
        me.setState(() => { throw new UnexpectedError(error); });
      });
  }
  
  // Close Modal and Keep parent data unchaged.
  closeModal() {
    // if (this.sampleClearLocationData.clearedCompanyId === '' || this.sampleClearLocationData.clearedCompanyId === undefined){
    //   this.getModalFormDataFromState();    
    // } 
    this.setState({ IsModalOpen: false });
    // If mold Location is not updated, Keep the old data in parent state.
    this.setState({clearLocationData: this.sampleClearLocationData});
    this.setState({
      companyId:this.state.clearLocationData.clearedCompanyId ? this.state.clearLocationData.clearedCompanyId :'',
      companyName:this.state.clearLocationData.clearedCompanyName ? this.state.clearLocationData.clearedCompanyName :'',
      locationId:this.state.clearLocationData.clearedLocationId ? this.state.clearLocationData.clearedLocationId :'',
      locationName:this.state.clearLocationData.clearedLocationName ? this.state.clearLocationData.clearedLocationName :'',
      instllationSiteId:this.state.clearLocationData.clearedInstllationSiteId ? this.state.clearLocationData.clearedInstllationSiteId :'',
      instllationSiteName:this.state.clearLocationData.clearedInstllationSiteName? this.state.clearLocationData.clearedInstllationSiteName :'',
    });
  }

  // Prepare Picker 
  preparePickers() {
    var me = this;
    Company.load()
      .then((response) => {
        me.mstCompanies = [...response.mstCompanies];
        me.createPickerCompany();
        //me.createPickerOwnerCompany();
      })
      .catch((err) => {
        var error = err;
        me.setState(() => { throw new UnexpectedError(error); });
      });
  }

  // Create Picker 
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

  // Create Picker  for Company
  createPickerCompany() {
    var me = this;
    if (me.pickerCompany) {
      me.pickerCompany.destroy();
    }
    var _values = [];
    var _displayValues = [];
    var defaultValue = '';
    var defaultName = '';
    if (this.state.companyId !== '') {
      defaultValue = this.state.companyId?this.state.companyId: ' ';
      defaultName = this.state.companyName?this.state.companyName: ' ';
    }

    for (var i = 0; i < me.mstCompanies.length; i++) {
      let company = me.mstCompanies[i];
      _values.push(company.id);
      _displayValues.push(company.companyName);
    }
    me.pickerCompany = me.createPicker('#mold-info-page-picker-company', _values, _displayValues,
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
    if (defaultValue !== '') {
      me.pickerCompany.setValue([defaultValue], 0);
      me.setState({companyId:  defaultValue});
      me.setState({companyName: defaultName});
      me.defaultInstllationSite = true;
      me.loadLocation();
    }
  }

  // Create Picker  for location
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
    if (me.defaultInstllationSite){
      me.loadInstllationSite();
      me.defaultInstllationSite = false;
    }
    me.pickerLocation = me.createPicker('#mold-info-page-picker-location', _values, _displayValues, 
      //Col Change Callback
      (picker, value, displayValue) => {
        const oldLocationId = me.state.locationId;
        me.setState({locationId:  value});
        me.setState({locationName: displayValue});
        if (oldLocationId !== value) {
          me.loadInstllationSite();
        }
        if (value !== '') {
          me.setState({errorMessageLocation: ''});
        }
      }
    );
  }
  
  // Create Picker  for installation Site
  createPickerInstllationSite() {
    var me = this;
    var _values = [];
    var _displayValues = [];
    for (var i = 0; i < me.mstInstllationSites.length; i++) {
      let instllationSite = me.mstInstllationSites[i];
      _values.push(instllationSite.id);
      _displayValues.push(instllationSite.installationSiteName);
    }
    if (me.pickerInstllationSite) {
      me.pickerInstllationSite.destroy();
    }
    me.pickerInstllationSite = me.createPicker('#mold-info-page-picker-installation-site', _values, _displayValues, 
      //Col Change Callback
      (picker, value, displayValue) => {
        me.setState({instllationSiteId:  value});
        me.setState({instllationSiteName: displayValue});
      }
    );
  }

  // Load Location
  loadLocation() {
    var me = this;
    var defaultValue = null;
    var defaultName = null;  
    defaultValue = me.state.locationId?me.state.locationId:'' ;
    defaultName = me.state.locationName?me.state.locationName:'' ;
    me.setState({locationId: defaultValue});
    me.setState({locationName: defaultName});
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

  // Load Installation Site
  loadInstllationSite() {
    var me = this;
    var defaultValue = '';
    var defaultName = '';
    if(me.defaultInstllationSite){
      defaultName = me.state.instllationSiteName;
      defaultValue = me.state.instllationSiteId;
    }else if (me.isQrScanned){
      defaultValue = me.state.instllationSiteId;
      defaultName = me.state.instllationSiteName; 
    }   
    me.setState({instllationSiteId: defaultValue});
    me.setState({instllationSiteName: defaultName});
    var selectedLocationId = me.state.locationId;
    var location = me.mstLocations.find((location) => {return (location.id === selectedLocationId);});
    if (location) {
      InstllationSite.load(location.locationCode, true)
        .then((response) => {
          me.mstInstllationSites = [...response.mstInstallationSites];
          me.createPickerInstllationSite();
        })
        .catch((err) => {
          var error = err;
          me.setState(() => { throw new UnexpectedError(error); });
        });
    }
  }

  // Get Attached file list for the searched mold
  getAttachedFile(){
    const me = this;
    this.clearAttachedFileList();
    let fileNameCollection = [];
    let filePathCollection = [];
    if(me.isFileLoaded) return ;
    if(me.state.reportFilePathName01 !== ''){
      fileNameCollection.push(me.state.reportFilePathName01);
    }
    if(me.state.reportFilePathName02 !== ''){
      fileNameCollection.push(me.state.reportFilePathName02);
    }
    if(me.state.reportFilePathName03 !== ''){
      fileNameCollection.push(me.state.reportFilePathName03);
    } 
    if(me.state.reportFilePathName04 !== ''){
      fileNameCollection.push(me.state.reportFilePathName04);
    } 
    if(me.state.reportFilePathName05 !== ''){
      fileNameCollection.push(me.state.reportFilePathName05);
    } 
    if(me.state.reportFilePathName06 !== ''){
      fileNameCollection.push(me.state.reportFilePathName06);
    } 
    if(me.state.reportFilePathName07 !== ''){
      fileNameCollection.push(me.state.reportFilePathName07);
    } 
    if(me.state.reportFilePathName08 !== ''){
      fileNameCollection.push(me.state.reportFilePathName08);
    } 
    if(me.state.reportFilePathName09 !== ''){
      fileNameCollection.push(me.state.reportFilePathName09);
    } 
    if(me.state.reportFilePathName10 !== ''){
      fileNameCollection.push(me.state.reportFilePathName10);
    } 

    if(me.state.reportFilePath01 !== ''){
      filePathCollection.push(me.state.reportFilePath01);
    } 
    if(me.state.reportFilePath02 !== ''){
      filePathCollection.push(me.state.reportFilePath02);
    } 
    if(me.state.reportFilePath03 !== ''){
      filePathCollection.push(me.state.reportFilePath03);
    } 
    if(me.state.reportFilePath04 !== ''){
      filePathCollection.push(me.state.reportFilePath04);
    } 
    if(me.state.reportFilePath05 !== ''){
      filePathCollection.push(me.state.reportFilePath05);
    } 
    if(me.state.reportFilePath06 !== ''){
      filePathCollection.push(me.state.reportFilePath06);
    } 
    if(me.state.reportFilePath07 !== ''){
      filePathCollection.push(me.state.reportFilePath07);
    } 
    if(me.state.reportFilePath08 !== ''){
      filePathCollection.push(me.state.reportFilePath08);
    } 
    if(me.state.reportFilePath09 !== ''){
      filePathCollection.push(me.state.reportFilePath09);
    } 
    if(me.state.reportFilePath10 !== ''){
      filePathCollection.push(me.state.reportFilePath10);
    }
    for(var i=0; i < filePathCollection.length; i++){
      if(filePathCollection[i] !== ''){
        me.fileNameUuidList.push(fileNameCollection[i]+','+filePathCollection[i]);
        me.isFileLoaded=true;
      }
    }
  }

  // Clear attach file List before getting new mold
  clearAttachedFileList() {
    this.fileNameUuidList=[];
    this.isFileLoaded= false;
  }

  // Display attach File in a List
  displayAttachedFile() {
    this.getAttachedFile();
    const items = this.fileNameUuidList.sort();
    if (!items.length) return;
    let fileList = items.map((item) => this.createListForFile(item));
    return (
      <List className={'no-margin no-padding normalFont'}>
        {fileList}
      </List>
    );
  }


  //Open Mold Parts screen
  redirectToMoldParts(){
    var me = this;
    var moldUuid = me.state.moldUuid ;
    if(moldUuid){
      Mold.getMoldParts(moldUuid)
        .then((response) => {
          if(response.length > 0) {
            this.$f7.views.main.router.navigate(APP_DIR_PATH + '/mold-part?moldUuid='+moldUuid, { pushState: true });
          }else{
            me.$f7.dialog.alert(me.state.dict.mst_error_record_not_found);
          }
        }).catch(function(err){
          var error = err;
          me.setState(() => { throw new UnexpectedError(error); });
        });
    }else{
      me.$f7.dialog.alert(me.state.dict.mst_error_record_not_found);
    }
  }

  // Load attach file as a individual ListItem
  createListForFile(item) {
    var nameUuid = item.split(',');
    return (
      <ListItem key={nameUuid[1]} link={()=> window.open()} onClick={()=>window.open(API_BASE_URL + 'files/download/doc/'+nameUuid[1])} swipeout id={item}>
        <div slot="inner" className="no-margin no-padding noFlexShrink">
          <Input className="custom-list-item">{nameUuid[0]}</Input>
        </div>
      </ListItem>
    );
  }
  
  // Image Information for Mold
  getImageByMoldId(){
    const me = this;  
    if(me.state.moldDetails.imgFilePath01 !== '' && me.state.moldDetails.imgFilePath01!== undefined){
      me.imageUuidList.push(me.state.moldDetails.imgFilePath01);
    }
    if(me.state.moldDetails.imgFilePath02 !== '' && me.state.moldDetails.imgFilePath02!== undefined){
      me.imageUuidList.push(me.state.moldDetails.imgFilePath02);
    }
    if(me.state.moldDetails.imgFilePath03 !== '' && me.state.moldDetails.imgFilePath03!== undefined){
      me.imageUuidList.push(me.state.moldDetails.imgFilePath03);
    }
    if(me.state.moldDetails.imgFilePath04 !== '' && me.state.moldDetails.imgFilePath04!== undefined){
      me.imageUuidList.push(me.state.moldDetails.imgFilePath04);
    }
    if(me.state.moldDetails.imgFilePath05 !== '' && me.state.moldDetails.imgFilePath05!== undefined){
      me.imageUuidList.push(me.state.moldDetails.imgFilePath05);
    }
    if(me.state.moldDetails.imgFilePath06 !== '' && me.state.moldDetails.imgFilePath06!== undefined){
      me.imageUuidList.push(me.state.moldDetails.imgFilePath06);
    }
    if(me.state.moldDetails.imgFilePath07 !== '' && me.state.moldDetails.imgFilePath07!== undefined){
      me.imageUuidList.push(me.state.moldDetails.imgFilePath07);
    }
    if(me.state.moldDetails.imgFilePath08 !== '' && me.state.moldDetails.imgFilePath08!== undefined){
      me.imageUuidList.push(me.state.moldDetails.imgFilePath08);
    }
    if(me.state.moldDetails.imgFilePath09 !== '' && me.state.moldDetails.imgFilePath09!== undefined){
      me.imageUuidList.push(me.state.moldDetails.imgFilePath09);
    }
    if(me.state.moldDetails.imgFilePath10 !== '' && me.state.moldDetails.imgFilePath10!== undefined){
      me.imageUuidList.push(me.state.moldDetails.imgFilePath10);
    }
    for (let imageUuid of me.imageUuidList) {
      me.createImageUrlByImageUuid(imageUuid);
    }
  }
  
  //delete mold Image
  deleteImg(index) {
    let me = this;
    me.$f7.dialog.create({
      text: this.state.dict.msg_confirm_delete,
      buttons: [{
        text: this.state.dict.yes,
        onClick: function () {
          let imageInfoList = me.state.imageInfo;
          imageInfoList.splice(index,1);
          me.setState({
            imageInfo: imageInfoList
          }, () => {
            me.updateImageDetails();
          });
        }
      }, {
        text: this.state.dict.no,
        onClick: function (dialog) {
          dialog.close();
        }
      }]
    }).open();
  }

  //upload camera image
  uploadImgByCamera() {
    if (this.state.moldId === '') {
      return this.setState({ errorMessageMoldId: this.state.dict.msg_error_not_null });
    }
    this.$f7router.navigate(APP_DIR_PATH + '/imgcap', {props: { onCapture: this.onImgCapture.bind(this) } });
  }
  
  //set image properties
  onImgCapture(captured) {
    let me = this;
    //let currentTabIndex = me.state.currentTabIndex;
    let type = captured.blob.type;
    let fileExtension = '.jpg';
    if (type.indexOf('png') >= 0) {
      fileExtension = '.png';
    }
    if (type.indexOf('gif') >= 0) {
      fileExtension = '.gif';
    }
    let newImageList = this.state.imageInfo;
    let src = captured.dataUrl;
    var fileOfBlob = new File([captured.blob], new Date().getTime() + fileExtension);
    newImageList.push({
      src: src,
      image: fileOfBlob,
      imageUuid: null,
    });
    me.setState({
      imageInfo: newImageList
    },()=>{
      me.registerImageFile();
    });
  }

  //set file format
  buttonFileSelect(event) {
    let me = this;
    //let currentTabIndex = me.state.currentTabIndex;
    let files = event.target.files || [];
    if (files.length <= 0) return;
    let file = files[0];
    let type = file.type;
    let fileExtension = '.jpg';
    if (type.indexOf('png') >= 0) {
      fileExtension = '.png';
    }
    if (type.indexOf('gif') >= 0) {
      fileExtension = '.gif';
    }

    let newImageList = this.state.imageInfo;
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function (e) {
      let src = e.target.result;
      FileUtil.shrinkImg(src, 750, 1000).then(shrinked=>{
        newImageList.push({
          src: shrinked.dataUrl,
          file: new File([shrinked.blob], new Date().getTime() + fileExtension),
          fileUuid: null,
        });
        me.setState({
          imageInfo: newImageList
        });
        let fileInput = document.getElementById('mold-info-image').childNodes;
        fileInput[0].value = '';
      });
    };
  }

  //upload image from file directory
  uploadImgFromDirectory(event) { 
    let me = this;
    if(me.state.imageInfo.length === 10){
      return me.$f7.dialog.alert(me.state.dict.msg_record_added);
    }
    let files = event.target.files || [];
    if (files.length <= 0) return;
    let file = files[0];
    let type = file.type;
    let imgExtension = '.jpg';
    if (type.indexOf('png') >= 0) {
      imgExtension = '.png';
    }
    if (type.indexOf('gif') >= 0) {
      imgExtension = '.gif';
    }
    let newImageList = this.state.imageInfo;
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function (e) {
      let src = e.target.result;
      FileUtil.shrinkImg(src, 750, 1000).then(shrinked => {
        newImageList.push({
          src: shrinked.dataUrl,
          image: new File([shrinked.blob], new Date().getTime() + imgExtension),
          imageUuid: null,
        });
        me.setState({
          imageInfo: newImageList
        },()=>{
          me.registerImageFile(); 
        }); 
      });
    };
  }

  //add/update image in database
  registerImageFile(){
    let me = this;
    var newImageList = me.state.imageInfo;
    let blobList =[];
    if (newImageList.length > 0){
      for(var item of newImageList){
        if(item.imageUuid === null){
          blobList.push(item.image);
        }
      }
      FileUtil.uploadsBlob(blobList, 'image' ,'15700')
        .then((response)=>{
          let imageUuid = response.fileUuid;
          for(var key in newImageList){        
            if(!newImageList[key]['imageUuid']){
              newImageList[key]['imageUuid'] = imageUuid; 
            }
          } 
          me.setState({
            imageInfo: newImageList
          },()=>{
            me.updateImageDetails();
          });
        })
        .catch((err) => {
          me.$f7.preloader.hide();
          var error = err;
          me.setState(() => { throw new UnexpectedError(error); });
        });   
    }
  }

  // get image url list and downlad image
  createImageUrlByImageUuid(imageUuid){
    var me = this;
    var url = API_BASE_URL + 'files/downloadImageVideo/image/' + imageUuid;
    me.imageUrlList.push(url);   
    var key = me.imageUuidList.indexOf(imageUuid);
    let value = me.imageUrlList[key];
    FileUtil.imgLoad(value).then((response) => {
      let imageFileFormat={
        src:response.src,
        image:response.blob,
        imageUuid: imageUuid};
      me.newImageInfo.push(imageFileFormat);
      if (me.newImageInfo.length === me.imageUrlList.length){
        me.setState({
          imageInfo:me.newImageInfo  
        });
      }
    }).catch(() => {
      me.newImageInfo=[];
      me.setState({
        imageInfo:me.newImageInfo  
      });
    });
  }

  // Display Image File
  renderImage(){   
    const me = this;
    return me.state.imageInfo.length > 0 ? me.state.imageInfo.map((picSource, picIndex) => {
      return <Card key={picIndex}>
        <CardContent>
          <List>
            <ListItem> 
              {
                !picSource.src
                  ?
                  <img className="contain" src={picSource.src} width="100%" height="200" alt="photo_1" id={'img' + picIndex}/>
                  :
                  <img className="contain" src={picSource.src} style={{ background: '#fff' }} width="100%" height="200" alt="photo_1" id={'img' + picIndex}/>
              }
            </ListItem>
          </List>
        </CardContent>
        <CardFooter>
          <p></p>
          <Link onClick={me.deleteImg.bind(me, picIndex)}>{me.state.dict.delete_record}</Link>
        </CardFooter>
      </Card>;     
    }):null;
  }

  // Display Location Change Modal Form 
  renderLocationChangeModalForm() {
    return (
      <List className="no-margin-top no-margin-bottom">
        <ListItem>
          <Label>{this.state.dict.company_name}</Label>
          <Input type="text" name="companyId" clearButton onInputClear={this.handleClearModalForm.bind(this)} readonly inputId="mold-info-page-picker-company"
            value={this.state.companyName} required validate 
            errorMessage={this.state.errorMessageCompany} errorMessageForce={this.state.errorMessageCompany!==''}
          />
        </ListItem>
        <ListItem>
          <Label>{this.state.dict.location_name}</Label>
          <Input type="text" name="locationId" clearButton onInputClear={this.handleClearModalForm.bind(this)} readonly inputId="mold-info-page-picker-location" 
            disabled={this.state.instllationSiteId === '' && this.state.companyId === '' }  value={this.state.locationName} required validate
            errorMessage={this.state.errorMessageLocation} errorMessageForce={this.state.errorMessageLocation!==''}
          />
        </ListItem>
        <ListItem className="custom-list-item">
          <Label>{this.state.dict.installation_site_name}</Label>
          <Input type="text" name="instllationSiteId" clearButton onInputClear={this.handleClearModalForm.bind(this)} readonly inputId="mold-info-page-picker-installation-site" 
            disabled={this.state.locationId === ''} value={this.state.instllationSiteName}
          />
          <div className="btn-absolute">
            <Button fill text="QR" small onClick={this.buttonInstllationSiteQRClick.bind(this)}></Button>
          </div>
        </ListItem>
        
      </List>
    );
  }

  // Display Default Parts 
  renderParts(){
    var componentList = this.state.componentDetails;
    if (componentList.length <= 0) return;
    if (componentList.length > 3){
      this.showArrow = true;
    }else{
      this.showArrow = false;
    }
    return componentList.map((item, itemIndex) => {
      if(itemIndex < 3){
        return ( <ListItem style={{width:'100%'}} key={itemIndex}>
          <Input>
            <ListItemRow >
              <ListItemCell>{this.state.dict.component_code}</ListItemCell>
              <ListItemCell className="text-align-left">{item.componentCode ? item.componentCode : ''}</ListItemCell>
            </ListItemRow>
            <ListItemRow>
              <ListItemCell>{this.state.dict.component_name}</ListItemCell>
              <ListItemCell className="text-align-left">{item.componentName ? item.componentName : ''}</ListItemCell>
            </ListItemRow>
            <ListItemRow>
              <ListItemCell>{this.state.dict.count_per_shot}</ListItemCell>
              <ListItemCell className="text-align-right">{item.countPerShot ? item.countPerShot : ''}</ListItemCell>
            </ListItemRow>
          </Input>
        </ListItem>
        );
      }else{
        return '';
      }     
    });
  }

  // Display Down Arrow for Multiple Parts
  renderDownArrow(){
    var arrowStatus = this.state.activateArrow;
    return<List noHairlinesBetween className="no-margin-top no-margin-bottom infinite-scroll">
      {
        arrowStatus
          ?
          <div style={{display: this.state.activateArrow? 'inline':'none' }}>
            <Button small iconF7="down" onClick={this.handleArrow.bind(this)}></Button>
          </div>
          :
          ''
      }        
    </List>;
  }

  // Display Multiple Parts
  renderMultipleParts(){
    var multipleComponentList = this.state.componentDetails;
    if(multipleComponentList.length>3){
      let initialIndex=0, splicedIndex=3;
      multipleComponentList.splice(initialIndex,splicedIndex);
      // let initialIndex=0, splicedIndex=3;
      // let removedItem = multipleComponentList.splice(initialIndex,splicedIndex);   
      // if (removedItem.length <= 3) {this.removedComponentList = removedItem;}
      return multipleComponentList.map((item, partIndex) => {
        return ( <ListItem style={{width:'100%'}} key={partIndex}>
          <Input>
            <ListItemRow >
              <ListItemCell>{this.state.dict.component_code}</ListItemCell>
              <ListItemCell className="text-align-left">{item.componentCode ? item.componentCode : ''}</ListItemCell>
            </ListItemRow>
            <ListItemRow>
              <ListItemCell>{this.state.dict.component_name}</ListItemCell>
              <ListItemCell className="text-align-left">{item.componentName ? item.componentName : ''}</ListItemCell>
            </ListItemRow>
            <ListItemRow>
              <ListItemCell>{this.state.dict.count_per_shot}</ListItemCell>
              <ListItemCell className="text-align-right">{item.countPerShot ? item.countPerShot : ''}</ListItemCell>
            </ListItemRow>
          </Input>
        </ListItem> 
        );
      });  
    }
  }

  // Display Up Arrow to Minimize Multiple Parts
  renderUpArrow(){
    var arrowStatus = this.state.activateArrow;
    return<List noHairlinesBetween className="no-margin-top no-margin-bottom infinite-scroll">
      {
        arrowStatus
          ?
          ''
          :
          <div style={{display: this.state.activateArrow? 'none':'inline' }}>
            <Button small iconF7="up"onClick={this.handleArrow.bind(this)}></Button>
          </div>
      }     
    </List>;
  }

  //Max Image Validation
  checkImageLimit(){
    var me = this;
    if (me.state.moldId === '') {
      return me.setState({ errorMessageMoldId: me.state.dict.msg_error_not_null });
    }
    else if(me.state.imageInfo.length === 10){
      return me.$f7.dialog.alert(me.state.dict.msg_error_image_limit_reached);
    }
  }

  // Display Mold Information Page
  render(){
    return(
      <DocumentTitle title={this.state.dict.sp_mold_reference}>
        <Page id="mold-info-page" onPageInit={this.onPageInit.bind(this)}>
          <AppNavbar applicationTitle={this.state.dict.application_title} showBack={true} backClick={this.onBackClick.bind(this)}></AppNavbar>
          <BlockTitle>{this.state.dict.sp_mold_reference}</BlockTitle>
          <List form={true} id="form" noHairlinesBetween className="no-margin-top no-margin-bottom">
            <ListGroup>
              <ListItem className="custom-list-item">
                <Label >{this.state.dict.mold_id}</Label>
                <Input type="text" name="moldId"
                  value={this.state.moldId} clearButton
                  onInputClear={this.handleClear.bind(this)}
                  onChange={this.handleChange.bind(this)}
                  errorMessage={this.state.errorMessageMoldId}
                  errorMessageForce={this.state.errorMessageMoldId !== ''}
                  inputId="mold-info-page-mold-id"/>   
                <div className="btn-absolute">
                  <Button fill text="QR" small onClick={this.buttonMoldQRClick.bind(this)}></Button>
                </div>
              </ListItem >
              <ListItem className="custom-list-item">
                <Label>{this.state.dict.mold_name}</Label>
                <Input>{this.state.moldName}</Input>
                <div className="btn-absolute">
                  <Button fill iconF7="search" small onClick={this.buttonMoldSearch.bind(this)}></Button>
                </div>
              </ListItem>
            </ListGroup>
            <Block>
              <ListItemRow>
                <ListItemCell>{this.state.dict.main_asset_no}</ListItemCell> 
                <ListItemCell className="text-align-left">{this.state.mainAssetNo ? this.state.mainAssetNo : ''}</ListItemCell>
              </ListItemRow>
              <ListItemRow>
                <ListItemCell >{this.state.dict.mold_created_date}</ListItemCell>
                <ListItemCell className="text-align-left">{ this.state.moldCreatedDate ? moment(new Date(this.state.moldCreatedDate)).format('YYYY/MM/DD') : ''}</ListItemCell>
              </ListItemRow>
              <ListItemRow>
                <ListItemCell >{this.state.dict.inspected_date}</ListItemCell >
                <ListItemCell className="text-align-left">{ this.state.inspectedDate ? moment(new Date(this.state.inspectedDate)).format('YYYY/MM/DD') : ''}</ListItemCell>
              </ListItemRow>
              <ListItemRow>
                <ListItemCell >{this.state.dict.owner_company_name}</ListItemCell >
                <ListItemCell className="text-align-left">{this.state.ownerCompanyName ? this.state.ownerCompanyName : ''}</ListItemCell>
              </ListItemRow>
              <ListItemRow>
                <ListItemCell >{this.state.dict.installed_date}</ListItemCell >
                <ListItemCell className="text-align-left">{ this.state.installedDate? moment(new Date(this.state.installedDate)).format('YYYY/MM/DD') : ''}</ListItemCell>
              </ListItemRow>
              <ListItemRow>
                <ListItemCell >{this.state.dict.company_name}</ListItemCell >
                <ListItemCell className="text-align-left">{this.state.companyName ? this.state.companyName : ''}</ListItemCell>
              </ListItemRow>
              <ListItemRow>
                <ListItemCell >{this.state.dict.location_name}</ListItemCell >
                <ListItemCell className="text-align-left" >{this.state.locationName ? this.state.locationName : ''}</ListItemCell>
              </ListItemRow>
              <ListItemRow>
                <ListItemCell >{this.state.dict.installation_site_name}</ListItemCell >
                <ListItemCell style={{'marginLeft': '80px'}} className="text-align-left">{this.state.instllationSiteName ? this.state.instllationSiteName : ''}</ListItemCell>       
                {
                  this.state.islocationChangePermitted
                    ?
                    <Button  small iconF7="compose" onClick={this.buttonChangeMoldLocation.bind(this)}></Button>
                    :
                    ''  
                }            
              </ListItemRow>
            </Block>
            <Block>
              <Modal
                isOpen={this.state.IsModalOpen}
                onRequestClose={this.closeModal.bind(this)}
                style={modalStyle}
                shouldCloseOnOverlayClick={false}
                parentSelector={() => { return document.querySelector('#mold-info-page'); }}
              >    
                {this.renderLocationChangeModalForm()}
                <Block>
                  <Row>
                    <Col width="50">
                      <Button fill onClick={this.registerChangedLocation.bind(this)}>{this.state.dict.ok}</Button>
                    </Col>
                    <Col width="50">
                      <Button fill onClick={this.closeModal}>{this.state.dict.cancel}</Button>
                    </Col>
                  </Row>
                </Block>
              </Modal>
            </Block>

            <BlockTitle>{this.state.dict.component}</BlockTitle>
            <Block> 
              <List accordionItem noHairlinesBetween className="no-margin-top no-margin-bottom infinite-scroll" >  
                {this.renderParts()}
                {this.showArrow?this.renderDownArrow():''}
                {this.state.activateArrow?'':this.renderMultipleParts()}
                {!this.showArrow?'':this.renderUpArrow()} 
              </List>
            </Block>

            <Block className="smallMargin smallPadding">
              <ListItemRow>
                <ListItemCell>{this.state.dict.mold_status}</ListItemCell>
                <ListItemCell className="text-align-left">{this.state.statusText ? this.state.statusText : ''}</ListItemCell>
              </ListItemRow>
              <ListItemRow>
                <ListItemCell>{this.state.dict.status_changed_date}</ListItemCell>
                <ListItemCell className="text-align-left">{ this.state.statusChangedDate ? moment(new Date(this.state.statusChangedDate)).format('YYYY/MM/DD') : ''}</ListItemCell>
              </ListItemRow>
              <ListItemRow>
                <ListItemCell>{this.state.dict.mold_mainte_status}</ListItemCell>
                <ListItemCell className="text-align-left">{this.state.mainteStatusText ? this.state.mainteStatusText : ''}</ListItemCell>
              </ListItemRow>
              <ListItemRow>
                <ListItemCell>{this.state.dict.user_department}</ListItemCell>
                <ListItemCell className="text-align-left">{this.state.departmentName ? this.state.departmentName : ''}</ListItemCell>
              </ListItemRow>
              <ListItemRow>
                <ListItemCell>{this.state.dict.mold_last_production_date}</ListItemCell>
                <ListItemCell className="text-align-left">{this.state.lastProductionDate ? moment(new Date(this.state.lastProductionDate)).format('YYYY/MM/DD') : ''}</ListItemCell>
              </ListItemRow>
              <ListItemRow>
                <ListItemCell>{this.state.dict.mold_total_production_time_hour}</ListItemCell>
                <ListItemCell className="text-align-right">{this.state.totalProducingTimeHour ? this.state.totalProducingTimeHour : ''}</ListItemCell>
              </ListItemRow>
              <ListItemRow>
                <ListItemCell>{this.state.dict.mold_total_shot_count}</ListItemCell>
                <ListItemCell className="text-align-right">{this.state.totalShotCount ? this.state.totalShotCount:''}</ListItemCell>
              </ListItemRow>
              <ListItemRow>
                <ListItemCell>{this.state.dict.mold_last_mainte_date}</ListItemCell>
                <ListItemCell className="text-align-left">{ this.state.lastMainteDate ? moment(new Date(this.state.lastMainteDate)).format('YYYY/MM/DD') : ''}</ListItemCell>
              </ListItemRow>
              <ListItemRow>
                <ListItemCell>{this.state.dict.mold_after_mainte_total_production_time_hour}</ListItemCell>
                <ListItemCell className="text-align-right">{this.state.afterMainteTotalProducingTimeHour ? this.state.afterMainteTotalProducingTimeHour:''}</ListItemCell>
              </ListItemRow>
              <ListItemRow>
                <ListItemCell>{this.state.dict.mold_after_mainte_total_shot_count}</ListItemCell>
                <ListItemCell className="text-align-right">{this.state.afterMainteTotalShotCount ? this.state.afterMainteTotalShotCount:''}</ListItemCell>
              </ListItemRow>
              <ListItemRow>
                <ListItemCell>{this.state.dict.mold_mainte_cycle_code_01}</ListItemCell>
                <ListItemCell className="text-align-left">{this.state.mainteCycleCode01 ? this.state.mainteCycleCode01:''}</ListItemCell>
              </ListItemRow>
            </Block>             
            <BlockTitle>{this.state.dict.mold_image}</BlockTitle>
            <Block>
              <Row >
                <Col width="50">
                  <Button small fill iconF7="camera" onClick={this.state.imageInfo.length===10? this.checkImageLimit.bind(this):this.uploadImgByCamera.bind(this)}></Button>
                </Col>
                <Col width="50" style={{  position: 'relative', height: 28, overflow: 'hidden' }}>
                  <Button small fill iconF7="photos"onClick={this.checkImageLimit.bind(this)}></Button>
                  {this.state.imageInfo.length===10? this.checkImageLimit.bind(this):
                    <input type="file" id="mold-info-image" accept="image/*"  onChange={this.uploadImgFromDirectory.bind(this)}></input>
                  }
                </Col>
              </Row>    
            </Block>
            <Block>
              {this.renderImage()}
            </Block>
            <List accordionList noHairlinesBetween className="no-margin-top no-margin-bottom infinite-scroll">
              <ListItem accordionItem title={this.state.dict.issue_report_attached_file}>
                <AccordionContent>
                  {this.displayAttachedFile()} 
                </AccordionContent>
              </ListItem>
            </List>
            <List noHairlinesBetween className="no-margin-top no-margin-bottom infinite-scroll">
              <ListItem  link onClick={(e)=>(this.redirectToMoldParts(e))} title={this.state.dict.mold_part}></ListItem>
            </List>
          </List>          
        </Page>
      </DocumentTitle>
    );
  }
}