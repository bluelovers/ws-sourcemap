/**
 * Created by user on 2019/12/26.
 */

interface Interface
{
	[id: string]: Record<'originalPositionFor' | 'generatedPositionFor', Record<'actual' | 'expected', {
		line: number,
		column: number,
	}>>
}

export default <Interface>{
	'001': {
		originalPositionFor: {
			actual: {
				line: 75,
				column: 9,
			},
			expected: {
				line: 99,
				column: 9,
			},
		},
		generatedPositionFor: {
			actual: {
				line: 99,
				column: 9,
			},
			expected: {
				line: 75,
				column: 9,
			},
		},
	},
	'002': {
		originalPositionFor: {
			actual: {
				line: 10,
				column: 7,
			},
			expected: {
				line: 9,
				column: 12,
			},
		},
		generatedPositionFor: {
			actual: {
				line: 9,
				column: 12,
			},
			expected: {
				line: 10,
				column: 7,
			},
		},
	},
}
