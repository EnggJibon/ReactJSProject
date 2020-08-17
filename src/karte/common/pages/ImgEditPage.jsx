import React from 'react';
import {
  Page,
  Navbar,
  Button,
  Toolbar
} from 'framework7-react';
import DictionaryLoader from 'karte/shared/logics/dictionary-loader';
import {APP_DIR_PATH} from 'karte/shared/logics/app-location';
import {UnexpectedError} from 'karte/shared/logics/errors';
import ImgEdit from 'karte/shared/components/ImgEdit';

/**
 * 画像編集ページ。
 * 以下のように、ページ遷移時にpropsへ編集対象の画像とコールバック用イベントハンドラーを渡す。
 * this.$f7router.navigate(APP_DIR_PATH + '/imgcap', {props:{onCapture: this.onCapture.bind(this), imageSrc: imagesrc}});
 * imageSrcはHTMLImageElement型のインスタンス。
 * イベントハンドラのコールバックは
 * onCapture(captured)
 * のように引数capturedを受け取り、下記プロパティを持つ。
 * captured
 * {
 *  imgData: 編集後のImageData, 
 *  blob: 編集後の画像のblob,
 *  dataUrl: 編集後の画像のdata:URL(canvas.toDataURL())
 * }
 */
export default class ImgEditPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dict: {
        application_title: '',
        msg_swipe_to_scroll: ''
      }
    };
    this.imgEditref = React.createRef();
    this.done = false;
  }

  componentDidMount() {
    const me = this;
    DictionaryLoader.getDictionary(this.state.dict)
      .then(values => {
        me.setState({dict: values});
        const toast = this.$f7.toast.create({
          text: values.msg_swipe_to_scroll,
          closeTimeout: 2000
        });
        toast.open();
      })
      .catch(err => {
        if (err.errorCode === 'E103') {
          me.$f7.views.main.router.navigate(APP_DIR_PATH + '/login', {reloadAll: true});
        } else {
          me.setState(() => { throw new UnexpectedError(err); });
        }
      });
  }

  finEdit() {
    if(this.done) {
      return;
    }

    this.imgEditref.current.takeEditedPict().then((captured)=>{
      if(this.props.onCapture) {
        this.props.onCapture(captured);
      }
      this.$f7router.back();
    });
    this.done = true;
  }

  clearEdit() {
    this.imgEditref.current.clearEdit();
  }

  render() {
    return <Page>
      <Navbar title={this.state.dict.application_title} backLink="Back"></Navbar>
      <ImgEdit ref={this.imgEditref} style={{width: '100%', height: '100%'}} imageSrc={this.props.imageSrc}></ImgEdit>
      <Toolbar bottomMd={true}>
        <Button iconMaterial='check' onClick={this.finEdit.bind(this)}></Button>
        <Button iconMaterial='undo' onClick={this.clearEdit.bind(this)}></Button>
      </Toolbar>
    </Page>;
  }
}