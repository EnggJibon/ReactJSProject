import React from 'react';
import {
  Fab,
  Icon
} from 'framework7-react';

export default class VideoCap extends React.Component {
  constructor(props) {
    super(props);
    this.vinput = document.createElement('input');
    this.vinput.setAttribute('type', 'file');
    this.vinput.setAttribute('accept', 'video/*');
    this.vinput.setAttribute('capture', props.capture);
    this.vinput.onchange = () => {
      if(this.vinput.files.length === 0 || !this.props.onCapture) {
        return;
      }
      this.props.onCapture(this.vinput.files[0]);
    };
    this.capture = this.capture.bind(this);
  }

  capture() {
    this.vinput.click();
  }

  render() {
    return <Fab position={this.props.position} slot="fixed" color="blue" onClick={this.capture}>
      <Icon material='videocam'></Icon>
    </Fab>;
  }
}