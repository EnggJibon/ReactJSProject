/**
 * ルーティング定義ファイル
 * 新規追加方法
 * 1. 追加するページのコンポーネントクラスをインポート
 * 2. routes配列に定義を追加
 * 
 * # メインメニューに表示するものはmenu-controllerにも追加すること
 */

import { APP_DIR_PATH } from 'karte/shared/logics/app-location';
import Authentication from 'karte/shared/logics/authentication';
import Authorization from 'karte/shared/logics/authorization';
import HomePage from 'karte/common/pages/HomePage';
import LoginPage from 'karte/common/pages/LoginPage';
import PasswordResetPage from 'karte/common/pages/PasswordResetPage';
import ChangeInitialPasswordPage from 'karte/common/pages/ChangeInitialPasswordPage';
import NotFoundPage from 'karte/common/pages/NotFoundPage';
import UnauthorizedErrorPage from 'karte/common/pages/UnauthorizedErrorPage';
import PanelRightPage from 'karte/common/pages/PanelRightPage';
import MoldInventoryPage from 'karte/apps/mold/pages/inventory/MoldInventoryPage';
import MoldInventoryResultPage from 'karte/apps/mold/pages/inventory/MoldInventoryResultPage';
import MachineInventoryPage from 'karte/apps/machine/pages/inventory/MachineInventoryPage';
import MachineInventoryResultPage from 'karte/apps/machine/pages/inventory/MachineInventoryResultPage';
import IssueSubMenuPage from 'karte/apps/core/pages/issue/IssueSubMenuPage';
import IssueListPage from 'karte/apps/core/pages/issue/IssueListPage';
import IssueRegisterPage from 'karte/apps/core/pages/issue/IssueRegisterPage';
import MoldMainteSubMenuPage from 'karte/apps/mold/pages/maintenance/MoldMainteSubMenuPage';
import MachineMainteSubMenuPage from 'karte/apps/machine/pages/maintenance/MachineMainteSubMenuPage';
import MachineMainteStartPage from 'karte/apps/machine/pages/maintenance/MachineMainteStartPage';

import MachineMainteStartIssuePage from 'karte/apps/machine/pages/maintenance/MachineMainteStartIssuePage';
import MachineMainteInputPage from 'karte/apps/machine/pages/maintenance/MachineMainteInputPage';
import MachineMainteRecommendPage from 'karte/apps/machine/pages/maintenance/MachineMainteRecommendPage';
import MachineMainteInspectionPage from 'karte/apps/machine/pages/maintenance/MachineMainteInspectionPage';
import MachineMainteEndPage from 'karte/apps/machine/pages/maintenance/MachineMainteEndPage';

import MoldInfoPage from 'karte/apps/mold/pages/info/MoldInfoPage.jsx';
import MoldPartsPage from 'karte/apps/mold/pages/info/MoldPartsPage.jsx';
import MoldMainteStartPage from 'karte/apps/mold/pages/maintenance/MoldMainteStartPage';
import MoldMainteStartIssuePage from 'karte/apps/mold/pages/maintenance/MoldMainteStartIssuePage';
import MoldMainteInputPage from 'karte/apps/mold/pages/maintenance/MoldMainteInputPage';
import MoldMainteReplaceRepairParts from 'karte/apps/mold/pages/maintenance/MoldPartsMainteReplaceRepairPage';
import MoldMainteRecommendPage from 'karte/apps/mold/pages/maintenance/MoldMainteRecommendPage';
import MoldMainteEndPage from 'karte/apps/mold/pages/maintenance/MoldMainteEndPage';
import MoldMainteInspectionPage from 'karte/apps/mold/pages/maintenance/MoldMainteInspectionPage';
import OrderPointAlertPage from 'karte/apps/mold/pages/maintenance/OrderPointAlertPage';
import ProductionSubMenuPage from 'karte/apps/core/pages/production/ProductionSubMenuPage';
import ProductionStartPage from 'karte/apps/core/pages/production/ProductionStartPage';
import ProductionStartMaterialPage from 'karte/apps/core/pages/production/ProductionStartMaterialPage';
import InProductionPage from 'karte/apps/core/pages/production/InProductionPage';
import ProductionDetailPage from 'karte/apps/core/pages/production/ProductionDetailPage';
import ProductionEndPage from 'karte/apps/core/pages/production/ProductionEndPage';
import ProductionEndMaterialPage from 'karte/apps/core/pages/production/ProductionEndMaterialPage';
import ProductionDefectRegistrationPage from 'karte/apps/core/pages/production/ProductionDefectRegistrationPage';
import ShipmentPage from 'karte/apps/core/pages/shipment/ShipmentPage';
import QrPage from 'karte/common/pages/QrPage';
import ImgCapPage from 'karte/common/pages/ImgCapPage';
import ImgEditPage from 'karte/common/pages/ImgEditPage';
import VideoCapSamplePage from 'karte/common/pages/VideoCapSamplePage';
import MoldSearch from 'karte/shared/components/search/Mold';
import MachineSearch from 'karte/shared/components/search/Machine';
import ComponentSearch from 'karte/shared/components/search/Component';
import MaterialSearch from 'karte/shared/components/search/Material';
import MultipleComponent from 'karte/shared/components/search/MultipleComponent';
import SingleMold from 'karte/shared/components/search/SingleMold';
import SingleComponent from 'karte/shared/components/search/SingleComponent';
import WorkSubMenuPage from 'karte/apps/core/pages/work/WorkSubMenuPage';
import WorkEndListPage from 'karte/apps/core/pages/work/WorkEndListPage';
import WorkReportListPage from 'karte/apps/core/pages/work/WorkReportListPage';
import WorkStartInputPage from 'karte/apps/core/pages/work/WorkStartInputPage';
import WorkEndInputPage from 'karte/apps/core/pages/work/WorkEndInputPage';
import MachineListPage from 'karte/apps/machine/pages/report/MachineListPage';
import MachineReportListPage from 'karte/apps/machine/pages/report/MachineReportListPage';
import MachineEndMaterialPage from 'karte/apps/machine/pages/report/MachineEndMaterialPage';
import MachineProductionCountPage from 'karte/apps/machine/pages/report/MachineProductionCountPage';
import MachineStopTimeRegPage from 'karte/apps/machine/pages/report/MachineStopTimeRegPage';
import MachineDefectRegistrationPage from 'karte/apps/machine/pages/report/MachineDefectRegistrationPage';

function controlAccess(functionId, resolve, reject) {
  if (Authentication.isLoggedIn()) {
    if (functionId == null) {
      resolve();
    }
    else {
      Authorization.hasPermission(functionId)
        .then(() => resolve())
        .catch(() => {
          reject();
        });
    }
  }
  else {
    window.location = APP_DIR_PATH + '/login';
  }
}

const routes = [
  { //メインメニュー
    path: APP_DIR_PATH + '/',
    async(routeTo, routeFrom, resolve) {
      controlAccess(null, () => resolve({ component: HomePage }), () => resolve({ component: LoginPage }));
    }
  },
  { //ログイン
    path: APP_DIR_PATH + '/login',
    component: LoginPage
  },
  { //パスワードリセット
    path: APP_DIR_PATH + '/password-reset',
    component: PasswordResetPage
  },
  { //初期パスワード変更
    path: APP_DIR_PATH + '/init-password-change',
    component: ChangeInitialPasswordPage
  },
  { //金型棚卸実施
    path: APP_DIR_PATH + '/mold-inventory',
    async(routeTo, routeFrom, resolve) {
      controlAccess('15000', () => resolve({ component: MoldInventoryPage }), () => resolve({ component: UnauthorizedErrorPage }));
    }
  },
  { //金型棚卸実施 - 検索結果
    path: APP_DIR_PATH + '/mold-inventory-result',
    async(routeTo, routeFrom, resolve) {
      controlAccess('15000', () => resolve({ component: MoldInventoryResultPage }), () => resolve({ component: UnauthorizedErrorPage }));
    }
  },
  { //設備棚卸実施
    path: APP_DIR_PATH + '/machine-inventory',
    async(routeTo, routeFrom, resolve) {
      controlAccess('25000', () => resolve({ component: MachineInventoryPage }), () => resolve({ component: UnauthorizedErrorPage }));
    }
  },
  { //設備棚卸実施 - 検索結果
    path: APP_DIR_PATH + '/machine-inventory-result',
    async(routeTo, routeFrom, resolve) {
      controlAccess('25000', () => resolve({ component: MachineInventoryResultPage }), () => resolve({ component: UnauthorizedErrorPage }));
    }
  },
  { //不具合情報サブメニュー
    path: APP_DIR_PATH + '/issue-sub-menu',
    async(routeTo, routeFrom, resolve) {

      controlAccess('15100', () => resolve({ component: IssueSubMenuPage }), () => resolve({ component: UnauthorizedErrorPage }));
    }
  },
  { //不具合一覧
    path: APP_DIR_PATH + '/issue-list',
    async(routeTo, routeFrom, resolve) {

      controlAccess('15100', () => resolve({ component: IssueListPage }), () => resolve({ component: UnauthorizedErrorPage }));
    }
  },
  { //不具合入力
    path: APP_DIR_PATH + '/issue-register',
    async(routeTo, routeFrom, resolve) {

      controlAccess('15100', () => resolve({ component: IssueRegisterPage }), () => resolve({ component: UnauthorizedErrorPage }));
    }
  },
  { //金型メンテナンスサブメニュー
    path: APP_DIR_PATH + '/mold-mainte-sub-menu',
    async(routeTo, routeFrom, resolve) {

      controlAccess('15200', () => resolve({ component: MoldMainteSubMenuPage }), () => resolve({ component: UnauthorizedErrorPage }));
    }
  },
  { //金型メンテナンス開始
    path: APP_DIR_PATH + '/mold-mainte-start',
    async(routeTo, routeFrom, resolve) {

      controlAccess('15200', () => resolve({ component: MoldMainteStartPage }), () => resolve({ component: UnauthorizedErrorPage }));
    }
  },
  { //金型メンテナンス開始 - 不具合対策確認
    path: APP_DIR_PATH + '/mold-mainte-start-issue',
    async(routeTo, routeFrom, resolve) {

      controlAccess('15200', () => resolve({ component: MoldMainteStartIssuePage }), () => resolve({ component: UnauthorizedErrorPage }));
    }
  },
  { //金型メンテナンス開始 - 内容入力
    path: APP_DIR_PATH + '/mold-mainte-input',
    async(routeTo, routeFrom, resolve) {

      controlAccess('15200', () => resolve({ component: MoldMainteInputPage }), () => resolve({ component: UnauthorizedErrorPage }));
    }
  },
  {
    path: APP_DIR_PATH + '/mold-part-mainte-replace-repair',
    async(routeTo, routeFrom, resolve) {

      controlAccess('15200', () => resolve({ component: MoldMainteReplaceRepairParts }), () => resolve({ component: UnauthorizedErrorPage }));
    }
  },
  { //金型定期メンテナンス候補一覧
    path: APP_DIR_PATH + '/mold-mainte-recommend',
    async(routeTo, routeFrom, resolve) {

      controlAccess('15200', () => resolve({ component: MoldMainteRecommendPage }), () => resolve({ component: UnauthorizedErrorPage }));
    }
  },
  { //金型メンテナンス終了
    path: APP_DIR_PATH + '/mold-mainte-end',
    async(routeTo, routeFrom, resolve) {

      controlAccess('15200', () => resolve({ component: MoldMainteEndPage }), () => resolve({ component: UnauthorizedErrorPage }));
    }
  },
  { //金型メンテナンス点検結果
    path: APP_DIR_PATH + '/mold-mainte-insp',
    async(routeTo, routeFrom, resolve) {

      controlAccess('15200', () => resolve({ component: MoldMainteInspectionPage }), () => resolve({ component: UnauthorizedErrorPage }));
    }
  },
  {
    path: APP_DIR_PATH + '/moldpart-orderpoint',
    async(routeTo, routeFrom, resolve) {
      controlAccess('15200', () => resolve({ component: OrderPointAlertPage }), () => resolve({ component: UnauthorizedErrorPage }));
    }
  },
  { //設備メンテナンスサブメニュー
    path: APP_DIR_PATH + '/machine-mainte-sub-menu',
    async(routeTo, routeFrom, resolve) {

      controlAccess('25100', () => resolve({component: MachineMainteSubMenuPage}), () => resolve({component: UnauthorizedErrorPage}));
    }
  },
  { //設備メンテナンス開始
    path: APP_DIR_PATH + '/machine-mainte-start',
    async(routeTo, routeFrom, resolve) {

      controlAccess('25100', () => resolve({component: MachineMainteStartPage}), () => resolve({component: UnauthorizedErrorPage}));
    }
  },
  { //設備メンテナンス開始 - 不具合対策確認
    path: APP_DIR_PATH + '/machine-mainte-start-issue',
    async(routeTo, routeFrom, resolve) {

      controlAccess('25100', () => resolve({component: MachineMainteStartIssuePage}), () => resolve({component: UnauthorizedErrorPage}));
    }
  },
  { //設備メンテナンス開始 - 内容入力
    path: APP_DIR_PATH + '/machine-mainte-input',
    async(routeTo, routeFrom, resolve) {

      controlAccess('25100', () => resolve({component: MachineMainteInputPage}), () => resolve({component: UnauthorizedErrorPage}));
    }
  },
  { //設備定期メンテナンス候補一覧
    path: APP_DIR_PATH + '/machine-mainte-recommend',
    async(routeTo, routeFrom, resolve) {

      controlAccess('25100', () => resolve({component: MachineMainteRecommendPage}), () => resolve({component: UnauthorizedErrorPage}));
    }
  },
  { //設備メンテナンス終了
    path: APP_DIR_PATH + '/machine-mainte-end',
    async(routeTo, routeFrom, resolve) {

      controlAccess('25100', () => resolve({component: MachineMainteEndPage}), () => resolve({component: UnauthorizedErrorPage}));
    }
  },
  { //設備メンテナンス点検結果
    path: APP_DIR_PATH + '/machine-mainte-insp',
    async(routeTo, routeFrom, resolve) {

      controlAccess('25100', () => resolve({component: MachineMainteInspectionPage}), () => resolve({component: UnauthorizedErrorPage}));
    }
  },
  // ===========
  { //生産登録サブメニュー
    path: APP_DIR_PATH + '/production-sub-menu',
    async(routeTo, routeFrom, resolve) {

      controlAccess('15300', () => resolve({ component: ProductionSubMenuPage }), () => resolve({ component: UnauthorizedErrorPage }));
    }
  },
  { //生産開始
    path: APP_DIR_PATH + '/production-start',
    async(routeTo, routeFrom, resolve) {

      controlAccess('15300', () => resolve({ component: ProductionStartPage }), () => resolve({ component: UnauthorizedErrorPage }));
    }
  },
  { //生産開始 - 材料等登録
    path: APP_DIR_PATH + '/production-start-material',
    async(routeTo, routeFrom, resolve) {

      controlAccess('15300', () => resolve({ component: ProductionStartMaterialPage }), () => resolve({ component: UnauthorizedErrorPage }));
    }
  },
  { //生産中
    path: APP_DIR_PATH + '/in-production',
    async(routeTo, routeFrom, resolve) {

      controlAccess('15300', () => resolve({ component: InProductionPage }), () => resolve({ component: UnauthorizedErrorPage }));
    }
  },
  { //生産明細
    path: APP_DIR_PATH + '/production-detail',
    async(routeTo, routeFrom, resolve) {

      controlAccess('15300', () => resolve({ component: ProductionDetailPage }), () => resolve({ component: UnauthorizedErrorPage }));
    }
  },
  { //生産終了
    path: APP_DIR_PATH + '/production-end',
    async(routeTo, routeFrom, resolve) {

      controlAccess('15300', () => resolve({ component: ProductionEndPage }), () => resolve({ component: UnauthorizedErrorPage }));
    }
  },
  {//生産不良数登録
    path: APP_DIR_PATH + '/production-defect-registration',
    async(routeTo, routeFrom, resolve) {

      controlAccess('15300', () => resolve({ component: ProductionDefectRegistrationPage }), () => resolve({ component: UnauthorizedErrorPage }));
    }
  },
  { //生産終了 - 材料登録
    path: APP_DIR_PATH + '/production-end-material',
    async(routeTo, routeFrom, resolve) {

      controlAccess('15300', () => resolve({ component: ProductionEndMaterialPage }), () => resolve({ component: UnauthorizedErrorPage }));
    }
  },
  { //出荷登録
    path: APP_DIR_PATH + '/shipment',
    async(routeTo, routeFrom, resolve) {

      controlAccess('15400', () => resolve({ component: ShipmentPage }), () => resolve({ component: UnauthorizedErrorPage }));
    }
  },
  {
    path:APP_DIR_PATH + '/mold-info',
    async(routeTo,routeFrom,resolve){  
      controlAccess('15700', () => resolve({ component: MoldInfoPage }), () => resolve({ component: UnauthorizedErrorPage }));
    }
  },
  {
    path: APP_DIR_PATH + '/mold-part',
    async(routeTo, routeFrom, resolve) {
      controlAccess('15700', () => resolve({ component: MoldPartsPage }), () => resolve({ component: UnauthorizedErrorPage }));
    }
  },
  { //作業登録サブメニュー
    path: APP_DIR_PATH + '/work-sub-menu',
    async(routeTo, routeFrom, resolve) {

      controlAccess('15500', () => resolve({ component: WorkSubMenuPage }), () => resolve({ component: UnauthorizedErrorPage }));
    }
  },
  { //作業開始
    path: APP_DIR_PATH + '/work-start-input',
    async(routeTo, routeFrom, resolve) {

      controlAccess('15500', () => resolve({ component: WorkStartInputPage }), () => resolve({ component: UnauthorizedErrorPage }));
    }
  },
  { //作業終了一覧
    path: APP_DIR_PATH + '/work-end-list',
    async(routeTo, routeFrom, resolve) {

      controlAccess('15500', () => resolve({ component: WorkEndListPage }), () => resolve({ component: UnauthorizedErrorPage }));
    }
  },
  { //作業終了
    path: APP_DIR_PATH + '/work-end-input',
    async(routeTo, routeFrom, resolve) {

      controlAccess('15500', () => resolve({ component: WorkEndInputPage }), () => resolve({ component: UnauthorizedErrorPage }));
    }
  },
  { //作業日報一覧
    path: APP_DIR_PATH + '/work-daily-report-list',
    async(routeTo, routeFrom, resolve) {

      controlAccess('15500', () => resolve({ component: WorkReportListPage }), () => resolve({ component: UnauthorizedErrorPage }));
    }
  },
  { //スマホ版機械日報
    path: APP_DIR_PATH + '/report',
    async(routeTo, routeFrom, resolve) {

      controlAccess('15600', () => resolve({ component: MachineListPage }), () => resolve({ component: UnauthorizedErrorPage }));
    }
  },
  {
    path: APP_DIR_PATH + '/report-detail',
    async(routeTo, routeFrom, resolve) {

      controlAccess('15600', () => resolve({ component: MachineReportListPage }), () => resolve({ component: UnauthorizedErrorPage }));
    }
  },
  {
    path: APP_DIR_PATH + '/report-end-material',
    async(routeTo, routeFrom, resolve) {

      controlAccess('15600', () => resolve({ component: MachineEndMaterialPage }), () => resolve({ component: UnauthorizedErrorPage }));
    }
  },
  {
    path: APP_DIR_PATH + '/report-production-count-register',
    async(routeTo, routeFrom, resolve) {

      controlAccess('15600', () => resolve({ component: MachineProductionCountPage }), () => resolve({ component: UnauthorizedErrorPage }));
    }
  },
  {
    path: APP_DIR_PATH + '/report-stop-time-register',
    async(routeTo, routeFrom, resolve) {

      controlAccess('15600', () => resolve({ component: MachineStopTimeRegPage }), () => resolve({ component: UnauthorizedErrorPage }));
    }
  },
  {
    path: APP_DIR_PATH + '/report-defect-register',
    async(routeTo, routeFrom, resolve) {

      controlAccess('15600', () => resolve({ component: MachineDefectRegistrationPage }), () => resolve({ component: UnauthorizedErrorPage }));
    }
  },
  {
    path: APP_DIR_PATH + '/qrpage',
    component: QrPage
  },
  {
    path: APP_DIR_PATH + '/imgcap',
    component: ImgCapPage
  },
  {
    path: APP_DIR_PATH + '/imgedit',
    component: ImgEditPage
  },
  {
    path: APP_DIR_PATH + '/videocapsample',
    component: VideoCapSamplePage
  },
  {
    path: '/panel-right/',
    component: PanelRightPage,
  },
  {
    path: APP_DIR_PATH + '/moldsearch',
    component: MoldSearch,
  },
  {
    path: APP_DIR_PATH + '/machinesearch',
    component: MachineSearch,
  },
  {
    path: APP_DIR_PATH + '/componentsearch',
    component: ComponentSearch,
  },
  {
    path: APP_DIR_PATH + '/materialSearch',
    component: MaterialSearch,
  },
  {
    path: APP_DIR_PATH + '/multiplecomponent',
    component: MultipleComponent,
  },
  {
    path: APP_DIR_PATH + '/singlecomponent',
    component: SingleComponent,
  },
  {
    path: APP_DIR_PATH + '/singlemold',
    component: SingleMold,
  },
  {
    path: APP_DIR_PATH + '/testcomp',
    async(routeTo, routeFrom, resolve) {
      controlAccess('99999', ()=>{
        import(/* webpackChunkName: "spkartemod" */'sp-plugin-sample').then((SpModules) => {
          resolve({component: SpModules.default.TestComponent});
        });
      });
    }
  },
  {
    path: APP_DIR_PATH + '/testcomp2',
    async(routeTo, routeFrom, resolve) {
      import(/* webpackChunkName: "spkartemod" */'sp-plugin-sample').then((SpModules) => {
        resolve({component: SpModules.default.TestComponent2});
      });
    }
  },
  //NotFoundPageは必ず最後になるようにすること。 NotFoundPage must be the last.
  {
    path: APP_DIR_PATH + '(.*)',
    component: NotFoundPage
  },
];

export default routes;