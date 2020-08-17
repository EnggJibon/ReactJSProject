import React from 'react';
import {
  Navbar,
  NavTitle,
  NavRight,
  NavLeft,
  Link,
} from 'framework7-react';
import {APP_DIR_PATH} from 'karte/shared/logics/app-location';

export default function AppNavbar(props) {
  var navBack = '';
  //戻るリンクの表示指定
  if (props.showBack) {
    //クリックイベントまたはURLのどちらかのみ指定可能。
    if (props.backClick) {
      navBack = 
        <NavLeft><Link iconF7="arrow_left" onClick={props.backClick}/></NavLeft>;
    }
    else {
      navBack = 
        <NavLeft><Link iconF7="arrow_left" href={props.backLinkUrl}/></NavLeft>;
    }
  }
  var navRight = <NavRight>
    <Link iconIos="f7:menu" iconMd="material:menu" panelOpen="right"></Link>
  </NavRight>;
  if(props.hideNavRight){
    navRight = '';
  }
  return (
    <Navbar>
      {navBack}
      <NavTitle><Link noLinkClass href={APP_DIR_PATH + '/'} text={props.applicationTitle}/></NavTitle>
      {navRight}
    </Navbar>
  );
}

