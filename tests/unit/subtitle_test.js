describe('subtitle test', function () {
    var subtitle = require('subtitle');

    beforeEach(function () {

    });

    it('tests that correct subs are shown for given time', function () {
        var t1 = {data: [
            {subtitle: {start: 0, text: 'a'}},
            {subtitle: {start: 3, text: 'b'}},
            {subtitle: {start: 9.1, text: 'c'}}
        ]};

        var sub1 = subtitle.findSub(t1, 1);
        expect(sub1).toBe(t1.data[0]);

        var sub2 = subtitle.findSub(t1, 3.1);
        expect(sub2).toBe(t1.data[1]);

        var sub3 = subtitle.findSub(t1, -1);
        expect(sub3).toBe(t1.data[0]);

        var sub4 = subtitle.findSub(t1, 50);
        expect(sub4).toBe(t1.data[2]);

    });

    it('tests that subtitles are aligned properly (alignSubs)', function () {
        var t1 = {data: [
            {subtitle: {start: 0.5, text: 'a'}},
            {subtitle: {start: 3, text: 'b'}},
            {subtitle: {start: 9, text: 'c'}}
        ]};
        var t2 = {data: [
            {subtitle: {start: 0, text: '1'}},
            {subtitle: {start: 3.2, text: '2'}},
            {subtitle: {start: 9, text: '3'}}
        ]};
        var aligned = subtitle.alignSubs(t1, t2);
        var expected1 = {data: [
            {subtitle:{start: 0, text: 'a', id: 1}},
            {subtitle:{start: 3, text: 'b', id: 2}},
            {subtitle:{start: 9, text: 'c', id: 3}}
        ]};
        var expected2 = {data: [
            {subtitle:{start: 0, text: '1', id: 1}},
            {subtitle:{start: 3, text: '2', id: 2}},
            {subtitle:{start: 9, text: '3', id: 3}}
        ]};
        expect(aligned.sub1).toEqual(expected1);
        expect(aligned.sub2).toEqual(expected2);

        //-------------------------------------------------
        t1 = {data: [
            {subtitle: {start: 0.5, text: 'a'}},
            {subtitle: {start: 3, text: 'b'}},
            {subtitle: {start: 9, text: 'c'}}
        ]};
        t2 = {data: [
            {subtitle: {start: 3.2, text: '2'}},
            {subtitle: {start: 9, text: '3'}}
        ]};
        aligned = subtitle.alignSubs(t1, t2);
        expected1 = {data: [
            {subtitle:{start: 0.5, text: 'a', id: 1}},
            {subtitle:{start: 3, text: 'b', id: 2}},
            {subtitle:{start: 9, text: 'c', id: 3}}
        ]};
        expected2 = {data: [
            {subtitle:{start: 3, text: '2', id: 1}},
            {subtitle:{start: 9, text: '3', id: 2}}
        ]};
        expect(aligned.sub1).toEqual(expected1);
        expect(aligned.sub2).toEqual(expected2);

        //------------------------------------------------- merging
        t1 = {data: [
            {subtitle: {start: 0.5, text: 'a'}},
            {subtitle: {start: 3, text: 'b'}},
            {subtitle: {start: 9, text: 'c'}}
        ]};
        t2 = {data: [
            {subtitle: {start: 0, text: '2'}},
            {subtitle: {start: 9, text: '3'}}
        ]};
        aligned = subtitle.alignSubs(t1, t2);
        expected1 = {data: [
            {subtitle:{start: 0, text: 'a b', id: 1}},
            {subtitle:{start: 9, text: 'c', id: 2}}
        ]};
        expected2 = {data: [
            {subtitle:{start: 0, text: '2', id: 1}},
            {subtitle:{start: 9, text: '3', id: 2}}
        ]};
        expect(aligned.sub1).toEqual(expected1);
        expect(aligned.sub2).toEqual(expected2);

        //-------------------------------------------------
        t1 = {data: [
            {subtitle: {start: 0.5, text: 'a'}},
            {subtitle: {start: 3, text: 'b'}},
            {subtitle: {start: 9, text: 'c'}}
        ]};
        t2 = {data: [
            {subtitle: {start: 0, text: '1'}},
            {subtitle: {start: 0.5, text: '2'}},
            {subtitle: {start: 1.5, text: '3'}},
            {subtitle: {start: 2.5, text: '4'}}
        ]};
        aligned = subtitle.alignSubs(t1, t2);
        expected1 = {data: [
            {subtitle:{start: 0, text: 'a', id: 1}},
            {subtitle:{start: 2.5, text: 'b', id: 2}},
            {subtitle:{start: 9, text: 'c', id: 3}}
        ]};
        expected2 = {data: [
            {subtitle:{start: 0, text: '1 2 3', id: 1}},
            {subtitle:{start: 2.5, text: '4', id: 2}}
        ]};
        expect(aligned.sub1).toEqual(expected1);
        expect(aligned.sub2).toEqual(expected2);

        //-------------------------------------------------
        t1 = {data: [
            {subtitle: {start: 0, text: 'a'}},
            {subtitle: {start: 4, text: 'b'}},
            {subtitle: {start: 8, text: 'c'}}
        ]};
        t2 = {data: [
            {subtitle: {start: 2, text: '1'}},
            {subtitle: {start: 6, text: '2'}},
            {subtitle: {start: 10, text: '3'}}
        ]};
        aligned = subtitle.alignSubs(t1, t2);
        expected1 = {data: [
            {subtitle:{start: 0, text: 'a b c', id: 1}}
        ]};
        expected2 = {data: [
            {subtitle:{start: 2, text: '1 2', id: 1}},
            {subtitle:{start: 10, text: '3', id: 2}}
        ]};
        expect(aligned.sub1).toEqual(expected1);
        expect(aligned.sub2).toEqual(expected2);
    });
});