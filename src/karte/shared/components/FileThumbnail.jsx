import React from 'react';
import {
  Row,
  // List,
  ListItem,
} from 'framework7-react';
import { API_BASE_URL } from 'karte/shared/logics/api-agent';
import Word from 'image/files_icon/msword_icon.png';
import Excel from 'image/files_icon/msexcel_icon.png';
import PPT from 'image/files_icon/msppt_icon.png';
import PDF from 'image/files_icon/pdf_icon.png';
import Picture from 'image/files_icon/picture_icon.png';
import Others from 'image/files_icon/others_icon.png';

export default class FileThumbnail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dict: {

      },
    };
  }
  makeList() {
    const items = this.props.fileName.sort();
    if (!items.length) return;
    let fileList = items.map((item) => this.makeListRow(item));
    return (
      <Row className="filelist">
        {fileList}
      </Row>
    );
  }

  makeListRow(item) {
    var name= item.name;
    var Uuid = item.id;
    var fileExtension = name.substr(name.length - 5); 

    var File_Type = name;
    var Thumbnail_Image = '';
    var line_break = <br></br>;


    if(fileExtension.indexOf('.docx') > -1 || fileExtension.indexOf('.doc') > -1)
    {
      Thumbnail_Image = <img src={Word} alt="none"/>;
    }
    else if(fileExtension.indexOf('.xlsx') > -1 || fileExtension.indexOf('.xls') > -1)
    {
      Thumbnail_Image = <img src={Excel} alt="none"/>;
    }
    else if(fileExtension.indexOf('.pptx') > -1 || fileExtension.indexOf('.ppt') > -1)
    {
      Thumbnail_Image = <img src={PPT} alt="none"/>;
    }
    else if(fileExtension.indexOf('.pdf') > -1)
    {
      Thumbnail_Image = <img src={PDF} alt="none"/>;
    }
    else if(fileExtension.indexOf('.jpg') > -1 || fileExtension.indexOf('.jpeg') > -1 || fileExtension.indexOf('.bmp') > -1 || fileExtension.indexOf('.png') > -1 || fileExtension.indexOf('.gif') > -1)
    {
      Thumbnail_Image = <img src={Picture} alt="none"/>;
    }
    else
    {
      Thumbnail_Image = <img src={Others} alt="none"/>;
    }
    return (
      <ListItem key={Uuid} onClick={()=>window.open(API_BASE_URL + 'files/download/doc/'+Uuid)} swipeout id={item.id}>
        <div slot="inner" className="no-margin no-padding noFlexShrink">
          <label>{Thumbnail_Image}{line_break}{File_Type}</label>
        </div>
      </ListItem>
    );
  }

  render() {
    return (
      <div>
        {this.makeList()}
      </div>
    );

  }
}


