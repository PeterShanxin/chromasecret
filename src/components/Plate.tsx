import {Candidate,AssessmentTrial,Condition} from '../profile/types';
import {drawPlate,drawAssessment,drawDither,degrade,View,RenderResult} from '../stimulus/render';
export class Plate extends React.Component<{candidate:Candidate;text:string;view?:View;width?:number;height?:number;condition?:Condition;onRender?:(canvas:HTMLCanvasElement,result:RenderResult)=>void},{error:string}> {
 canvas:HTMLCanvasElement|null=null;token=0;state={error:''};
 componentDidMount(){this.draw();}
 componentDidUpdate(previous:typeof this.props){if(JSON.stringify([previous.candidate,previous.text,previous.view,previous.width,previous.height,previous.condition])!==JSON.stringify([this.props.candidate,this.props.text,this.props.view,this.props.width,this.props.height,this.props.condition]))this.draw();}
 componentWillUnmount(){this.token++;}
 async draw(){if(!this.canvas)return;const token=++this.token;try{const p=this.props,r=drawPlate(this.canvas,p.candidate,p.text,p.view,p.width||1000,p.height||620);await degrade(this.canvas,p.condition||'original');if(token===this.token&&this.canvas)p.onRender?.(this.canvas,r);}catch(e){this.setState({error:String(e)});}}
 render(){return this.state.error?<p role="alert">Rendering failed: {this.state.error}</p>:<canvas className="stimulus-canvas" ref={(el:HTMLCanvasElement)=>{this.canvas=el;}} role="img" aria-label="Experimental color field. Identify the hidden text visually; the answer is not included in this label."/>;}
}
export class AssessmentPlate extends React.Component<{trial:AssessmentTrial}> {
 canvas:HTMLCanvasElement|null=null;componentDidMount(){this.draw();}componentDidUpdate(prev:typeof this.props){if(prev.trial.seed!==this.props.trial.seed)this.draw();}
 draw(){if(this.canvas)drawAssessment(this.canvas,this.props.trial);}
 render(){return <canvas ref={(el:HTMLCanvasElement)=>{this.canvas=el;}} className="stimulus-canvas" aria-label="Two regions of dots. A square may appear on the left or right." role="img"/>;}
}
export class Dither extends React.Component<{value:number;channel?:number}> {
 canvas:HTMLCanvasElement|null=null;resize=()=>this.draw();componentDidMount(){this.draw();window.addEventListener('resize',this.resize);}componentWillUnmount(){window.removeEventListener('resize',this.resize);}componentDidUpdate(){this.draw();}
 draw(){if(this.canvas)drawDither(this.canvas,this.props.value,this.props.channel??-1);}
 render(){return <canvas className="dither-canvas" ref={(el:HTMLCanvasElement)=>{this.canvas=el;}} aria-label="Left: fine checkerboard. Right: adjustable solid patch." role="img"/>;}
}
