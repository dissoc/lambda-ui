/* eslint-disable */
import React, {PropTypes} from "react";
import {connect} from "react-redux";
import Moment from "moment";
import Utils from "./ComponentUtils.es6";
import "moment-duration-format";
import {showBuildOutput} from "actions/OutputActions.es6";
import {viewBuildStep} from "./actions/BuildDetailActions.es6";
import {findParentOfFailedSubstep} from "steps/FailureStepFinder.es6";
import R from "ramda";
import {StateIcon} from "StateIcon.es6";
import {isStepInParallel} from "steps/InParallelChecker.es6";
import Toggles from "./DevToggles.es6";

export const duration = ({startTime, endTime}) => {
    const start = Moment(startTime);
    const end = Moment(endTime);

    const duration = Moment.duration(end.diff(start), "milliseconds");
    const durationString = duration.format("hh:mm:ss");
    return durationString.length < 5 ? "00:" + durationString : durationString;
};

export const getStepDuration = (step) => {
    if(step.endTime || !step.startTime){
        return step;
    }
    const endTime = Moment();
    return ({startTime: step.startTime, endTime: endTime});
};

export const BuildStep = props => {
    const {step, buildId, goIntoStepFn, showOutputFn, goIntoFailureStepFn, failureStep, isParallel} = props;

    if(Toggles.showParallelStepsDirectly){
        if(!isParallel && step.type === "parallel") {
            const steps = R.map(step => <BuildStepCon key={step.stepId} buildId={buildId} step={step}/>)(step.steps);
            return <div key={step.stepId} className="parallelColumn">{steps}</div>;
        }
    }

    const infos = <div>
        <StateIcon state={step.state}/>
        <div className="stepName">{step.name}</div>
        <div className="stepDuration">{duration(getStepDuration(step))}</div>
    </div>;

    const parallelLines = <div>
        <div className="verticalLine"></div>
        <div className="verticalLine"></div>
    </div>;

    const goIntoStepLink = <a className="toolLink goIntoStepLink" href="#" onClick={goIntoStepFn}><i className="fa fa-level-down" aria-hidden="true"></i></a>;
    const goIntoFailureStepLink = <a className="toolLink" href="#" onClick={() => goIntoFailureStepFn(failureStep)}><i class="fa fa-arrow-circle-o-down" aria-hidden="true"></i></a>;
    const showOutputLink = <a className="toolLink showOutputLink" href="#" onClick={showOutputFn}><i className="fa fa-align-justify" aria-hidden="true"></i></a>;
    const hasSubsteps = step.steps && step.steps.length !== 0;
    const parallelClass = isParallel ? "inParallel" : "";

    return <div className={Utils.classes("buildStep", step.state, parallelClass)}>
        {isParallel ? parallelLines : ""}
        {infos}
        <div className="toolBox">
            <div className="tool">{showOutputLink}</div>
            <div className="tool">{hasSubsteps ? goIntoStepLink : ""}</div>
            <div className="tool">{failureStep && hasSubsteps ? goIntoFailureStepLink : ""}</div>
            <div className="expandTools"></div>
        </div>
    </div>;
};
BuildStep.propTypes = {
    step: PropTypes.object.isRequired,
    buildId: PropTypes.number,
    failureStep: PropTypes.string,
    isParallel: PropTypes.bool,
    goIntoStepFn: PropTypes.func.isRequired,
    goIntoFailureStepFn: PropTypes.func.isRequired,
    showOutputFn: PropTypes.func.isRequired
};

const mapStateToProps = (state, ownProps) => {
    const newProps = R.merge(ownProps, {failureStep: findParentOfFailedSubstep(state, ownProps.buildId, ownProps.step.stepId),
                                        isParallel: isStepInParallel(state, ownProps.buildId, ownProps.step.stepId),
                                        buildId: ownProps.buildId});
    return newProps;
};

const mapDispatchToProps = (dispatch, ownProps) => {

    return {
        goIntoStepFn: () => dispatch(viewBuildStep(ownProps.buildId, ownProps.step.stepId)),
        showOutputFn: () => dispatch(showBuildOutput(ownProps.buildId, ownProps.step.stepId)),
        goIntoFailureStepFn: (failureStep) => dispatch(viewBuildStep(ownProps.buildId, failureStep))
    };
};
const BuildStepCon = connect(mapStateToProps, mapDispatchToProps)(BuildStep);
export default BuildStepCon;