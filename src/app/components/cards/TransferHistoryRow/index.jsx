import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';
// import Icon from 'app/components/elements/Icon';
import Memo from 'app/components/elements/Memo';
import { numberWithCommas, vestsToSp } from 'app/utils/StateFunctions';
import tt from 'counterpart';
import GDPRUserList from 'app/utils/GDPRUserList';
import { APP_URL, LIQUID_TOKEN_UPPERCASE } from 'app/client_config';

function formatScotAmount(quantity, precision) {
    return (quantity / Math.pow(10, precision)).toFixed(precision);
}

const postLink = (socialUrl, author, permlink) => (
    <a href={`${socialUrl}/@${author}/${permlink}`} target="_blank">
        {author}/{permlink}
    </a>
);

class TransferHistoryRow extends React.Component {
    render() {
        const { op, context } = this.props;
        // context -> account perspective

        /*  all transfers involve up to 2 accounts, context and 1 other. */

        let message = '';

        let description_start = '';
        let other_account = null;
        let description_end = '';

        if (op.from === context) {
            message = (
                <span>
                    {tt(
                        [
                            'transferhistoryrow_jsx',
                            'transfer',
                            'from_self',
                            'not_savings',
                        ],
                        { amount: `${op.quantity} ${LIQUID_TOKEN_UPPERCASE}` }
                    )}
                    {otherAccountLink(op.to)}
                </span>
            );
        } else if (op.to === context) {
            message = (
                <span>
                    {tt(
                        [
                            'transferhistoryrow_jsx',
                            'transfer',
                            'to_self',
                            'not_savings',
                        ],
                        { amount: `${op.quantity} ${LIQUID_TOKEN_UPPERCASE}` }
                    )}
                    {otherAccountLink(op.from)}
                </span>
            );
        } else if (op.type === 'staking_reward') {
            message = (
                <span>
                    {tt(['transferhistoryrow_jsx', 'staking_reward'], {
                        amount: `${formatScotAmount(
                            op.int_amount,
                            op.precision
                        )} ${LIQUID_TOKEN_UPPERCASE}`,
                    })}
                </span>
            );
        } else if (
            op.type === 'author_reward' ||
            op.type === 'curation_reward' ||
            op.type === 'comment_benefactor_reward' ||
            op.type === 'mining_reward'
        ) {
            message = (
                <span>
                    {tt(['transferhistoryrow_jsx', op.type], {
                        amount: `${formatScotAmount(
                            op.int_amount,
                            op.precision
                        )} ${LIQUID_TOKEN_UPPERCASE}`,
                    })}
                    {postLink(APP_URL, op.author, op.permlink)}
                </span>
            );
        } else {
            message = JSON.stringify({ ...op }, null, 2);
        }
        return (
            <tr key={op[0]} className="Trans">
                <td>
                    <TimeAgoWrapper date={op.timestamp} />
                </td>
                <td
                    className="TransferHistoryRow__text"
                    style={{ maxWidth: '40rem' }}
                >
                    {message}
                </td>
                <td
                    className="show-for-medium"
                    style={{ maxWidth: '40rem', wordWrap: 'break-word' }}
                >
                    <Memo text={op.memo} username={context} />
                </td>
            </tr>
        );
    }
}

const otherAccountLink = username =>
    GDPRUserList.includes(username) ? (
        <span>{username}</span>
    ) : (
        <Link to={`/@${username}`}>{username}</Link>
    );

export default connect(
    // mapStateToProps
    (state, ownProps) => {
        return {
            ...ownProps,
        };
    }
)(TransferHistoryRow);
