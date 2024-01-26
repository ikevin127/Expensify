import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import React from 'react';
import RenderHTML from '@components/RenderHTML';
import CONST from '@src/CONST';
import type {OriginalMessageSource} from '@src/types/onyx/OriginalMessage';

type RenderCommentHTMLProps = {
    source: OriginalMessageSource;
    html: string;
};

function RenderCommentHTML({html, source}: RenderCommentHTMLProps) {
    let sourceHTML = html;

    // email reply comments are wrapped / contain elements from the regex map keys due to
    // email formatting - we have to replace these elements with the regex map
    // values otherwise the markdown content won't be parsed correctly
    // See issue: https://github.com/Expensify/App/issues/34665
    Object.entries(CONST.COMMENT_HTML_REGEX_MAP).forEach(([key, value]) => {
        sourceHTML = sourceHTML.replace(new RegExp(key, 'g'), value);
    });

    // we use the parser.replace to convert the email reply content to markdown
    // non-markdown content won't be affected
    const parser = new ExpensiMark();
    const commentHtml = source === 'email' ? `<email-comment>${parser.replace(sourceHTML)}</email-comment>` : `<comment>${html}</comment>`;

    return <RenderHTML html={commentHtml} />;
}

RenderCommentHTML.displayName = 'RenderCommentHTML';

export default RenderCommentHTML;
