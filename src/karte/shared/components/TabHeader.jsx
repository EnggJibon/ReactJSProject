import React from 'react';
import {
  Link,

} from 'framework7-react';


export default class TabHeader extends React.Component {

  /**
   * props: {
   *  tabLinks: [
   *    {
   *      tabLinkId:  タブ要素のID
   *      tabLinkText: タブに表示するテキスト
   *      active: true/false (アクティブにしたいタグにtrueをセット)
   *    }
   *  ],
   *  
   * }
   * @param {*} props 
   */
  constructor(props) {
    super(props);
    this.state = {
      tabLinks: []
    };
    this.state.tabLinks = props.tabLinks;
    this.makeRow = this.makeRow.bind(this);
    //this.tabLinkClick = this.tabLinkClick.bind(this);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState.tabLinks.length !== nextProps.tabLinks.length) {
      return {tabLinks: nextProps.tabLinks};
    }
    return null;
  }

  tabLinkClick(tabIndex) {
    var newTabLinks = [...this.state.tabLinks];
    for (var i = 0; i < newTabLinks.length; i++) {
      newTabLinks[i].active = (i === tabIndex);
    }
    this.setState({ tabLinks: newTabLinks });
    this.props.onTabChange(tabIndex);
  }

  makeRow() {
    var tdList = [];
    for (var i = 0; i < this.state.tabLinks.length; i++) {
      var _borderWidth = (i === 0) ? '2px' : '2px 2px 2px 0'; //二つ目以降のタブは左側の罫線を描画しない
      var borderStyle = {
        borderWidth: _borderWidth,
        borderStyle: 'solid',
        whiteSpace: 'nowrap'
      };
      var tdClassName = 'border-color-blue padding-horizontal';
      var linkClassName = '';
      if (this.state.tabLinks[i].active) {
        //アクティブなタブはハイライトする
        tdClassName = tdClassName + ' bg-color-blue';
        linkClassName = linkClassName + ' text-color-white';
      }
      tdList.push(
        <td key={i} className={tdClassName} style={borderStyle}>
          <Link className={linkClassName} tabLink={'#' + this.state.tabLinks[i].tabLinkId} onClick={this.tabLinkClick.bind(this, i)}>
            {this.state.tabLinks[i].tabLinkText}
          </Link>
        </td>
      );
    }
    return tdList;

  }

  render() {
    return (
      <div style={{ overflowX: 'scroll' }}>
        <table style={{ border: '0', borderSpacing: '0' }} >
          <tbody>
            <tr>
              {this.makeRow()}
            </tr>
          </tbody>
        </table>
      </div>
    );

  }
}


