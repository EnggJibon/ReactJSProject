import Authorization from 'karte/shared/logics/authorization';
import dictionaryLoader from 'karte/shared/logics/dictionary-loader';

//UrlPathに複数のスラッシュを含めて階層にしないこと。例：/mold/inventoryは不可。/mold-inventoryとする。
const menuList = [
  {
    functionId:     '15700',
    urlPath:        '/mold-info',
    dictionaryKey:  'sp_mold_reference',
    dictionaryValue:''
  },
  {
    functionId:     '15100',
    urlPath:        '/issue-sub-menu',
    dictionaryKey:  'sp_issue_report',
    dictionaryValue:''
  },
  {
    functionId:     '15200',
    urlPath:        '/mold-mainte-sub-menu',
    dictionaryKey:  'sp_mold_maintenance',
    dictionaryValue:''
  },
  {
    functionId:     '25100',
    urlPath:        '/machine-mainte-sub-menu',
    dictionaryKey:  'sp_machine_maintenance',
    dictionaryValue:''
  },
  {
    functionId:     '15500',
    urlPath:        '/work-sub-menu',
    dictionaryKey:  'sp_work',
    dictionaryValue:''
  },
  {
    functionId:     '15300',
    urlPath:        '/production-sub-menu',
    dictionaryKey:  'sp_production',
    dictionaryValue:''
  },
  {
    functionId:     '15600',
    urlPath:        '/report',
    dictionaryKey:  'sp_daily_report',
    dictionaryValue:''
  },
  {
    functionId:     '15400',
    urlPath:        '/shipment',
    dictionaryKey:  'shipment_registration',
    dictionaryValue:''
  },
  {
    functionId:     '15000',
    urlPath:        '/mold-inventory',
    dictionaryKey:  'sp_mold_inventory',
    dictionaryValue:''
  },
  {
    functionId:     '25000',
    urlPath:        '/machine-inventory',
    dictionaryKey:  'sp_machine_inventory',
    dictionaryValue:''
  },
  {
    functionId:     '99999',
    urlPath:        '/videocapsample',
    dictionaryKey:  'mold_mainte_status_remodeling',
    dictionaryValue:''
  },
  {
    functionId:     '99999',
    urlPath:        '/testcomp',
    dictionaryKey:  'mold_mainte_status_remodeling',
    dictionaryValue:''
  }
];

export default class MenuController {
  static getAvailableMenuList() {
    //Dictionary取得用オブジェクト作成
    var dict = {};
    for (var i = 0; i < menuList.length; i++) {
      var menu = menuList[i];
      dict[menu.dictionaryKey] = '';
    }
    return new Promise(function (resolve, reject) {
      Promise.all([Authorization.getAvailableFunctions(), dictionaryLoader.getDictionary(dict)])
      //Authorization.getAvailableFunctions()
        .then(function(values) {
          var availableFunctions = values[0];
          dict = values[1];
          let availableMenus = [];
          for (var i = 0; i < menuList.length; i++) {
            var menu = menuList[i];
            if (availableFunctions.includes(menu.functionId)) {
              menu.dictionaryValue = dict[menu.dictionaryKey];
              availableMenus.push(menu);
            }
          }
          resolve(availableMenus);
        })
        .catch(function(err) {
          reject(err);
        });
    });
  }
}
