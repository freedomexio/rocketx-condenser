import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';
import { cleanReduxInput } from 'app/utils/ReduxForms';
import tt from 'counterpart';
import { APP_MAX_TAG, TAG_LIST, SCOT_TAG } from 'app/client_config';
import MultiSelect from '@khanacademy/react-multi-select';

const MAX_TAG = APP_MAX_TAG || 10;

const options = [];

TAG_LIST._tail.array.forEach((t, i) => {
    options.push({ label: t, value: i });
});

class CategorySelector extends React.Component {
    static propTypes = {
        // HTML props
        id: PropTypes.string, // DOM id for active component (focusing, etc...)
        autoComplete: PropTypes.string,
        placeholder: PropTypes.string,
        onChange: PropTypes.func.isRequired,
        onBlur: PropTypes.func.isRequired,
        isEdit: PropTypes.bool,
        disabled: PropTypes.bool,
        value: PropTypes.string,
        tabIndex: PropTypes.number,

        // redux connect (overwrite in HTML)
        trending: PropTypes.object.isRequired, // Immutable.List
    };
    static defaultProps = {
        autoComplete: 'on',
        id: 'CategorySelectorId',
        isEdit: false,
    };
    constructor() {
        super();
        this.state = {
            selected: [],
            primaryTag: SCOT_TAG,
        };
        this.shouldComponentUpdate = shouldComponentUpdate(
            this,
            'CategorySelector'
        );
    }
    componentDidMount() {
        // When editing a post, set first tag (always) and any following tags in tag picker, but only if they are valid categories
        const selected = [];
        const proptags = this.props.value.split(' ');
        if (proptags.length > 0) this.setState({ primaryTag: proptags[0] });
        proptags.forEach(t => {
            options.forEach(o => {
                if (o.label === t) selected.push(o.value);
            });
        });
        this.setState({ selected });
        this.handleTagChange(selected);
    }
    handleTagChange(selected) {
        this.setState({ selected });
        let sel = this.state.primaryTag;
        selected.forEach(i => {
            sel += ` ${options[i].label}`;
        });
        this.props.onChange(sel);
    }
    render() {
        console.log(this.props.value);
        const { selected } = this.state;

        const tagMultiSelect = (
            <div className="tag-multi-select">
                {
                    // The first tag (defaults to SCOT_TAG or the catgeory of the edited post is not shown in the tag picker since it cannot be changed)
                }
                <MultiSelect
                    hasSelectAll={false}
                    options={options}
                    selected={selected}
                    onSelectedChanged={selected =>
                        this.handleTagChange(selected)
                    }
                    overrideStrings={{
                        // TODO: Overwrite default strings with tt for multilingual support
                        selectSomeItems: `${tt(
                            'category_selector_jsx.select_a_tag'
                        )}...`,
                    }}
                />
            </div>
        );

        return <span>{tagMultiSelect}</span>;
    }
}
export function validateCategory(category, required = true) {
    if (!category || category.trim() === '')
        return required ? tt('g.required') : null;
    const cats = category.trim().split(' ');
    return (
        // !category || category.trim() === '' ? 'Required' :
        cats.length > MAX_TAG
            ? tt('category_selector_jsx.use_limited_amount_of_categories', {
                  amount: MAX_TAG,
              })
            : cats.find(c => c.length > 24)
              ? tt('category_selector_jsx.maximum_tag_length_is_24_characters')
              : cats.find(c => c.split('-').length > 2)
                ? tt('category_selector_jsx.use_one_dash')
                : cats.find(c => c.indexOf(',') >= 0)
                  ? tt('category_selector_jsx.use_spaces_to_separate_tags')
                  : cats.find(c => /[A-Z]/.test(c))
                    ? tt('category_selector_jsx.use_only_lowercase_letters')
                    : cats.find(c => !/^[a-z0-9-#]+$/.test(c))
                      ? tt('category_selector_jsx.use_only_allowed_characters')
                      : cats.find(c => !/^[a-z-#]/.test(c))
                        ? tt('category_selector_jsx.must_start_with_a_letter')
                        : cats.find(c => !/[a-z0-9]$/.test(c))
                          ? tt(
                                'category_selector_jsx.must_end_with_a_letter_or_number'
                            )
                          : null
    );
}
export default connect((state, ownProps) => {
    const trending = state.global.getIn(['tag_idx', 'trending']);
    // apply translations
    // they are used here because default prop can't acces intl property
    const placeholder = tt('category_selector_jsx.tag_your_story');
    return { trending, placeholder, ...ownProps };
})(CategorySelector);
