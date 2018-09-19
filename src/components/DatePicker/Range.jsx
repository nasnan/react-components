import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';

import DatePicker from './DatePicker';
import MonthPicker from './Month';
import Popover from 'components/Popover';
import uncontrolledDecorator from 'decorators/uncontrolled';

const formatString = { date: 'YYYY-MM-DD HH:mm:ss', month: 'YYYY-MM' };

import { isRangeDateValid } from './utils';
import {
    RangePopup,
    RangeSelect,
    RangeDateWrap,
    PickerIcon,
    RangeDateSeparator,
    RangePopupConfirmButton,
    RangePopupError,
    RangePopupFooter,
    RangePopupPickerContainer
} from './style';
import { Size } from './DatePicker';

const getDateFromOption = option => {
    if (moment.isDate(option) || moment.isMoment(option) || _.isNumber(option)) {
        return moment(option);
    } else {
        return moment().add(option);
    }
};

@uncontrolledDecorator(
    { onChangeName: ['onChange', 'onInitialChange'] },
    { valueName: 'option', onChangeName: 'onOptionChange' }
)
export default class Range extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            cache: props.value
        };
    }
    static propTypes = {
        /** 当前值，受控 */
        value: PropTypes.array,
        /** 默认值，非受控 */
        defaultValue: PropTypes.array,
        /** 修改回调，返回moment对象数组 */
        onChange: PropTypes.func,
        /** 初始化回调函数，传入option的情况下会输出option对应的值，配合option或者defaultOption使用 */
        onInitialChange: PropTypes.func,
        /** 选项 */
        options: PropTypes.array,
        /** 当前选项，受控 */
        option: PropTypes.string,
        /** 默认选项，非受控 */
        defaultOption: PropTypes.string,
        /** 选项变化回调 */
        onOptionChange: PropTypes.func,
        /** 自定义规则 */
        rules: PropTypes.shape({
            /** 可选值范围 */
            range: PropTypes.array
        }),
        type: PropTypes.oneOf(['date', 'month']),
        /** 控件尺寸 */
        size: PropTypes.oneOf(Size),
        /** 是否禁用 */
        disabled: PropTypes.bool
    };
    static defaultProps = {
        defaultValue: [moment(), moment()],
        onChange: () => {},
        onInitialChange: () => {},
        type: 'date',
        options: [],
        defaultOption: 'custom',
        onOptionChange: () => {},
        size: 'md'
    };
    componentDidMount = () => {
        const { option, options, onInitialChange, value } = this.props;
        if (option !== 'custom') {
            const optionInfo = _.find(options, _option => _option.value === option);
            if (optionInfo && optionInfo.range) {
                const range = optionInfo.range;
                onInitialChange([getDateFromOption(range.start), getDateFromOption(range.end)]);
            }
        } else {
            onInitialChange(value);
        }
    };

    handleChange = (tag, value) => {
        const { cache } = this.state;
        const [start, end] = cache;
        if (tag === 'start') {
            let s = value,
                e = end;
            this.setState({
                cache: [moment(s), moment(e)]
            });
        } else if (tag === 'end') {
            let s = start,
                e = value;
            this.setState({
                cache: [moment(s), moment(e)]
            });
        }
    };
    handleOptionChange = option => {
        const { onOptionChange, options, onChange } = this.props;
        onOptionChange(option);

        if (option !== 'custom') {
            const optionInfo = _.find(options, _option => _option.value === option);
            if (optionInfo && optionInfo.range) {
                const range = optionInfo.range;

                onChange([getDateFromOption(range.start), getDateFromOption(range.end)]);
            }
        }
    };
    confirmChange = () => {
        const { onChange } = this.props;
        const { cache } = this.state;
        onChange([...cache]);
        this.setState({
            visible: false
        });
    };
    handleVisibleChange = visible => {
        this.setState({
            visible
        });
    };

    render() {
        const { visible, cache } = this.state;
        /* eslint-disable no-unused-vars */
        const {
            options: _options,
            option,
            defaultOption,
            onOptionChange,
            value,
            defaultValue,
            onChange,
            onInitialChange,
            size,
            rules = {},
            type,
            disabled,
            ...rest
        } = this.props;
        /* eslint-enable no-unused-vars */
        const options = _options.concat({
            label: '自定义',
            value: 'custom'
        });
        const { range, custom: _c } = rules;
        let modifyAble = option === 'custom';
        let [start, end] = value;
        start = moment(start);
        end = moment(end);

        let [cStart, cEnd] = cache;
        cStart = moment(cStart);
        cEnd = moment(cEnd);

        const Picker = type === 'month' ? MonthPicker : DatePicker;
        const precision = type === 'month' ? 'month' : null;

        const isValid = isRangeDateValid(cStart, cEnd, rules, precision);

        return (
            <div {...rest}>
                <RangeSelect
                    options={options}
                    size={size}
                    value={option}
                    disabled={disabled}
                    onChange={this.handleOptionChange}
                />
                <Popover
                    visible={visible}
                    popup={
                        <RangePopup>
                            <RangePopupPickerContainer>
                                <span>起始</span>
                                <Picker
                                    value={cStart}
                                    rules={{
                                        range: range,
                                        custom: (date, value) => _c && _c(date, value, cStart, cEnd, 'start')
                                    }}
                                    onChange={v => this.handleChange('start', v)}
                                />
                            </RangePopupPickerContainer>
                            <RangePopupPickerContainer>
                                <span>结束</span>
                                <Picker
                                    value={cEnd}
                                    rules={{
                                        range: range,
                                        custom: (date, value) => _c && _c(date, value, cStart, cEnd, 'end')
                                    }}
                                    onChange={v => this.handleChange('end', v)}
                                />
                            </RangePopupPickerContainer>
                            <RangePopupFooter>
                                <div>
                                    {!isValid ? <RangePopupError>请重新选择</RangePopupError> : null}
                                    <RangePopupConfirmButton
                                        styleType="primary"
                                        onClick={this.confirmChange}
                                        disabled={!isValid}
                                    >
                                        确定
                                    </RangePopupConfirmButton>
                                </div>
                            </RangePopupFooter>
                        </RangePopup>
                    }
                    onVisibleChange={this.handleVisibleChange}
                    trigger={['click']}
                >
                    <RangeDateWrap size={size} modifyAble={modifyAble} disabled={disabled}>
                        <span>{start.format(formatString[type])}</span>
                        <RangeDateSeparator />
                        <span>{end.format(formatString[type])}</span>
                        <PickerIcon type="calendar" color="blue" />
                    </RangeDateWrap>
                </Popover>
            </div>
        );
    }
}

Range.Type = ['date', 'month'];
