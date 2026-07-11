import { SAMPLE_INPUTS } from '../data/sampleInputs'

export default function SampleInputButtons({ onPick, disabled }) {
  return (
    <div className="sample-buttons" role="group" aria-label="Load a sample household description">
      {SAMPLE_INPUTS.map((sample) => (
        <button
          key={sample.label}
          type="button"
          className="sample-buttons__item"
          disabled={disabled}
          onClick={() => onPick(sample.text)}
        >
          {sample.label}
        </button>
      ))}
    </div>
  )
}
